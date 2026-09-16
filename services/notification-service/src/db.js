import pg from 'pg';

const { Pool } = pg;

const databaseName = process.env.NOTIF_DB_NAME || 'notifdb';
const databaseUser = process.env.NOTIF_DB_USER || 'files';

const adminPool = new Pool({
  host: process.env.NOTIF_DB_HOST || 'files-db',
  port: Number(process.env.NOTIF_DB_PORT || 5432),
  user: databaseUser,
  password: process.env.NOTIF_DB_PASSWORD || 'filespass',
  database: 'postgres',
  max: 1,
});

export const pool = new Pool({
  host: process.env.NOTIF_DB_HOST || 'files-db',
  port: Number(process.env.NOTIF_DB_PORT || 5432),
  user: databaseUser,
  password: process.env.NOTIF_DB_PASSWORD || 'filespass',
  database: databaseName,
  max: 5,
});

export async function ensureDatabase() {
  const { rows } = await adminPool.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [databaseName]
  );

  if (rows.length === 0) {
    await adminPool.query(`CREATE DATABASE "${databaseName}" OWNER "${databaseUser}"`);
  }
}

export async function ensureSchema() {
  await ensureDatabase();
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS notifications (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID NOT NULL,
      type        TEXT NOT NULL,
      message     TEXT NOT NULL,
      file_id     UUID,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications (user_id, created_at DESC);
  `);
}

export async function insertNotification({ userId, type, message, fileId }) {
  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, type, message, file_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, type, message, fileId || null]
  );
  return rows[0];
}

export async function listForUser(userId, limit = 50) {
  const { rows } = await pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, limit]
  );
  return rows;
}

export async function ping() {
  await pool.query('SELECT 1');
}
