import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.FILES_DB_HOST || 'files-db',
  port: Number(process.env.FILES_DB_PORT || 5432),
  user: process.env.FILES_DB_USER || 'files',
  password: process.env.FILES_DB_PASSWORD || 'filespass',
  database: process.env.FILES_DB_NAME || 'filesdb',
  max: 5,
});

export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS files (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID NOT NULL,
      filename      TEXT NOT NULL,
      content_type  TEXT NOT NULL DEFAULT 'application/octet-stream',
      size_bytes    BIGINT NOT NULL DEFAULT 0,
      s3_key        TEXT NOT NULL,
      thumbnail_key TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS files_user_id_idx ON files (user_id);
  `);
}

export async function ping() {
  await pool.query('SELECT 1');
}
