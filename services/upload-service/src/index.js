import express from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { uploadKey } from './keys.js';
import { putObject, bucketReachable } from './s3.js';
import { publishEvent, ping as redisPing } from './redis.js';

const app = express();
const PORT = Number(process.env.PORT || 3003);
const FILES_SERVICE_URL = process.env.FILES_SERVICE_URL || 'http://files-service:3002';

// Buffer uploads in memory (fine for the demo; a hardening task is to stream
// straight to S3 for large files — see CHALLENGE.md stretch goals).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

function requireUser(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'missing x-user-id (gateway did not authenticate)' });
  req.userId = userId;
  next();
}

app.get('/healthz', (_req, res) => res.json({ status: 'ok', service: 'upload-service' }));

app.get('/readyz', async (_req, res) => {
  const checks = {};
  try { await redisPing(); checks.redis = 'ok'; } catch (e) { checks.redis = String(e.message || e); }
  try { await bucketReachable(); checks.s3 = 'ok'; } catch (e) { checks.s3 = String(e.message || e); }
  const ready = Object.values(checks).every((v) => v === 'ok');
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not-ready', checks });
});

// ---- POST /upload ----
app.post('/upload', requireUser, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file field is required (multipart/form-data)' });
  const { originalname, mimetype, size, buffer } = req.file;
  const s3Key = uploadKey(randomUUID(), originalname);

  try {
    // 1. Stream the object to S3.
    await putObject(s3Key, buffer, mimetype);

    // 2. Record metadata via files-service (source of truth for file identity).
    const metaRes = await fetch(`${FILES_SERVICE_URL}/files`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userId: req.userId,
        filename: originalname,
        contentType: mimetype,
        size,
        s3Key,
      }),
    });
    if (!metaRes.ok) {
      const body = await metaRes.text();
      throw new Error(`files-service responded ${metaRes.status}: ${body}`);
    }
    const file = await metaRes.json();

    // 3. Publish the async event for downstream consumers.
    await publishEvent('file.uploaded', {
      fileId: file.id,
      userId: req.userId,
      s3Key,
      filename: originalname,
      contentType: mimetype,
    });

    res.status(201).json(file);
  } catch (err) {
    console.error('upload failed', err);
    res.status(500).json({ error: 'upload failed', detail: String(err.message || err) });
  }
});

app.listen(PORT, () => console.log(`upload-service listening on :${PORT}`));
