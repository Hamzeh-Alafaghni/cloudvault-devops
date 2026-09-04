import Redis from 'ioredis';

const STREAM = process.env.REDIS_STREAM || 'cloudvault:events';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT || 6379),
  maxRetriesPerRequest: null,
});

// Publish an event onto the shared Redis Stream. Consumers (thumbnail-worker,
// notification-service) read via consumer groups and filter by `type`.
export async function publishEvent(type, payload) {
  return redis.xadd(STREAM, '*', 'type', type, 'data', JSON.stringify(payload));
}

export async function ping() {
  const pong = await redis.ping();
  if (pong !== 'PONG') throw new Error('unexpected redis ping response');
}
