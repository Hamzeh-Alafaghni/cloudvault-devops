import http from 'node:http';
import { parseFields, isImage, thumbnailKeyFor } from './events.js';
import { getObjectBuffer, putObject, bucketReachable } from './s3.js';
import { makeThumbnail } from './thumbnail.js';
import { ensureGroup, readBatch, ack, publishEvent, ping as redisPing } from './redis.js';

const PORT = Number(process.env.PORT || 3005);
const FILES_SERVICE_URL = process.env.FILES_SERVICE_URL || 'http://files-service:3002';

let running = true;

// ---- Health-only HTTP server (the worker itself is event-driven) ----
const server = http.createServer(async (req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', service: 'thumbnail-worker' }));
  }
  if (req.url === '/readyz') {
    const checks = {};
    try { await redisPing(); checks.redis = 'ok'; } catch (e) { checks.redis = String(e.message || e); }
    try { await bucketReachable(); checks.s3 = 'ok'; } catch (e) { checks.s3 = String(e.message || e); }
    const ready = Object.values(checks).every((v) => v === 'ok');
    res.writeHead(ready ? 200 : 503, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ status: ready ? 'ready' : 'not-ready', checks }));
  }
  res.writeHead(404).end();
});

async function handleFileUploaded(payload) {
  const { fileId, userId, s3Key, contentType } = payload;
  if (!isImage(contentType)) {
    console.log(`skip thumbnail for non-image file ${fileId} (${contentType})`);
    return;
  }
  const original = await getObjectBuffer(s3Key);
  const thumb = await makeThumbnail(original);
  const thumbKey = thumbnailKeyFor(fileId);
  await putObject(thumbKey, thumb, 'image/png');

  // Tell files-service where the thumbnail lives.
  const patch = await fetch(`${FILES_SERVICE_URL}/files/${fileId}/thumbnail`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ thumbnailKey: thumbKey }),
  });
  if (!patch.ok) console.error(`files-service PATCH failed: ${patch.status}`);

  await publishEvent('thumbnail.created', { fileId, userId, thumbnailKey: thumbKey });
  console.log(`thumbnail created for ${fileId} -> ${thumbKey}`);
}

async function consumeLoop() {
  await ensureGroup();
  console.log('thumbnail-worker consuming file.uploaded events...');
  while (running) {
    let batch;
    try {
      batch = await readBatch();
    } catch (err) {
      console.error('read error', err);
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }
    if (!batch) continue;
    for (const [, messages] of batch) {
      for (const [id, fields] of messages) {
        const { type, data } = parseFields(fields);
        try {
          if (type === 'file.uploaded') {
            await handleFileUploaded(JSON.parse(data));
          }
        } catch (err) {
          console.error(`failed to process ${id}`, err);
        } finally {
          // Ack even on failure so a poison message can't wedge the stream.
          // A hardening task is a dead-letter stream + retry policy.
          await ack(id);
        }
      }
    }
  }
}

server.listen(PORT, () => console.log(`thumbnail-worker health server on :${PORT}`));

consumeLoop().catch((err) => {
  console.error('consume loop crashed', err);
  process.exit(1);
});

function shutdown() {
  running = false;
  server.close(() => process.exit(0));
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
