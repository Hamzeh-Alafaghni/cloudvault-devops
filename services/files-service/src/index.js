import express from 'express';
import { pool, ensureSchema, ping } from './db.js';
import { presignDownload, bucketReachable } from './s3.js';
import { toFileDTO } from './serialize.js';

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3002);

// The gateway authenticates the caller and forwards the user id downstream.
function requireUser(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'missing x-user-id (gateway did not authenticate)' });
  req.userId = userId;
  next();
}

app.get('/healthz', (_req, res) => res.json({ status: 'ok', service: 'files-service' }));

app.get('/readyz', async (_req, res) => {
  const checks = {};
  try { await ping(); checks.db = 'ok'; } catch (e) { checks.db = String(e.message || e); }
  try { await bucketReachable(); checks.s3 = 'ok'; } catch (e) { checks.s3 = String(e.message || e); }
  const ready = Object.values(checks).every((v) => v === 'ok');
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not-ready', checks });
});

// ---- POST /files (INTERNAL: called by upload-service to record metadata) ----
app.post('/files', async (req, res) => {
  const { userId, filename, contentType, size, s3Key } = req.body || {};
  if (!userId || !filename || !s3Key) {
    return res.status(400).json({ error: 'userId, filename and s3Key are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO files (user_id, filename, content_type, size_bytes, s3_key)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, filename, contentType || 'application/octet-stream', size || 0, s3Key]
    );
    res.status(201).json(toFileDTO(rows[0]));
  } catch (err) {
    console.error('create file failed', err);
    res.status(500).json({ error: 'internal error' });
  }
});

// ---- PATCH /files/:id/thumbnail (INTERNAL: called by thumbnail-worker) ----
app.patch('/files/:id/thumbnail', async (req, res) => {
  const { thumbnailKey } = req.body || {};
  if (!thumbnailKey) return res.status(400).json({ error: 'thumbnailKey required' });
  try {
    const { rowCount } = await pool.query(
      'UPDATE files SET thumbnail_key = $1 WHERE id = $2',
      [thumbnailKey, req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('patch thumbnail failed', err);
    res.status(500).json({ error: 'internal error' });
  }
});

// ---- GET /files (list current user's files) ----
app.get('/files', requireUser, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM files WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    // Attach a short-lived thumbnail URL for the list view.
    const files = await Promise.all(
      rows.map(async (row) => ({
        ...toFileDTO(row),
        thumbnailUrl: row.thumbnail_key ? await presignDownload(row.thumbnail_key) : null,
      }))
    );
    res.json({ files });
  } catch (err) {
    console.error('list files failed', err);
    res.status(500).json({ error: 'internal error' });
  }
});

// ---- GET /files/:id (metadata + presigned download URL) ----
app.get('/files/:id', requireUser, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM files WHERE id = $1', [req.params.id]);
    const row = rows[0];
    if (!row) return res.status(404).json({ error: 'not found' });
    if (row.user_id !== req.userId) return res.status(403).json({ error: 'forbidden' });
    res.json({
      ...toFileDTO(row),
      downloadUrl: await presignDownload(row.s3_key),
      thumbnailUrl: row.thumbnail_key ? await presignDownload(row.thumbnail_key) : null,
    });
  } catch (err) {
    console.error('get file failed', err);
    res.status(500).json({ error: 'internal error' });
  }
});

async function start() {
  await ensureSchema();
  app.listen(PORT, () => console.log(`files-service listening on :${PORT}`));
}

start().catch((err) => {
  console.error('files-service failed to start', err);
  process.exit(1);
});
