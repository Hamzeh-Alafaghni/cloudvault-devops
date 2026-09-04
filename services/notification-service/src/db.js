import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.NOTIF_DB_HOST || 'files-db',
  port: Number(process.env.NOTIF_DB_PORT || 5432),
  user: process.env.NOTIF_DB_USER || 'files',
  password: process.env.NOTIF_DB_PASSWORD || 'filespass',
  database: process.env.NOTIF_DB_NAME || 'notifdb',
  max: 5,
});

export async function ensureSchema() {
  await pool.query(`
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
