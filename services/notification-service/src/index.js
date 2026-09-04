import express from 'express';
import { pool, ensureSchema, insertNotification, listForUser, ping as dbPing } from './db.js';
import { ensureGroup, readBatch, ack, ping as redisPing } from './redis.js';
import { parseFields, messageFor, SUBSCRIBED_TYPES } from './events.js';

const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT || 3004);

let running = true;

function requireUser(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'missing x-user-id (gateway did not authenticate)' });
  req.userId = userId;
  next();
}

app.get('/healthz', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));

app.get('/readyz', async (_req, res) => {
  const checks = {};
  try { await dbPing(); checks.db = 'ok'; } catch (e) { checks.db = String(e.message || e); }
  try { await redisPing(); checks.redis = 'ok'; } catch (e) { checks.redis = String(e.message || e); }
  const ready = Object.values(checks).every((v) => v === 'ok');
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not-ready', checks });
});

// ---- GET /notifications (current user's notifications) ----
app.get('/notifications', requireUser, async (req, res) => {
  try {
    const rows = await listForUser(req.userId);
    res.json({
      notifications: rows.map((r) => ({
        id: r.id,
        type: r.type,
        message: r.message,
        fileId: r.file_id,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    console.error('list notifications failed', err);
    res.status(500).json({ error: 'internal error' });
  }
});

async function consumeLoop() {
  await ensureGroup();
  console.log(`notification-service consuming ${SUBSCRIBED_TYPES.join(', ')}...`);
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
          if (SUBSCRIBED_TYPES.includes(type)) {
            const payload = JSON.parse(data);
            await insertNotification({
              userId: payload.userId,
              type,
              message: messageFor(type, payload),
              fileId: payload.fileId,
            });
          }
        } catch (err) {
          console.error(`failed to process ${id}`, err);
        } finally {
          await ack(id);
        }
      }
    }
  }
}

async function start() {
  await ensureSchema();
  app.listen(PORT, () => console.log(`notification-service listening on :${PORT}`));
  consumeLoop().catch((err) => {
    console.error('consume loop crashed', err);
    process.exit(1);
  });
}

start().catch((err) => {
  console.error('notification-service failed to start', err);
  process.exit(1);
});

function shutdown() { running = false; process.exit(0); }
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
