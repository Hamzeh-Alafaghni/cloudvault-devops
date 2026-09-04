import Redis from 'ioredis';

const STREAM = process.env.REDIS_STREAM || 'cloudvault:events';
const GROUP = 'thumbnail-workers';
const CONSUMER = `worker-${process.env.HOSTNAME || process.pid}`;

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT || 6379),
  maxRetriesPerRequest: null,
});

export async function ensureGroup() {
  try {
    await redis.xgroup('CREATE', STREAM, GROUP, '0', 'MKSTREAM');
  } catch (err) {
    if (!String(err.message || err).includes('BUSYGROUP')) throw err;
  }
}

export async function readBatch(blockMs = 5000, count = 10) {
  return redis.xreadgroup('GROUP', GROUP, CONSUMER, 'COUNT', count, 'BLOCK', blockMs, 'STREAMS', STREAM, '>');
}

export async function ack(id) {
  await redis.xack(STREAM, GROUP, id);
}

export async function publishEvent(type, payload) {
  return redis.xadd(STREAM, '*', 'type', type, 'data', JSON.stringify(payload));
}

export async function ping() {
  const pong = await redis.ping();
  if (pong !== 'PONG') throw new Error('unexpected redis ping response');
}
