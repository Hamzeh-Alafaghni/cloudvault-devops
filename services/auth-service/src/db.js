import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.AUTH_DB_HOST || 'auth-db',
  port: Number(process.env.AUTH_DB_PORT || 5432),
  user: process.env.AUTH_DB_USER || 'auth',
  password: process.env.AUTH_DB_PASSWORD || 'authpass',
  database: process.env.AUTH_DB_NAME || 'authdb',
  max: 5,
});

// Idempotent schema bootstrap. Real migrations live in ./migrations and are
// also applied by scripts/seed.sh; running this on startup keeps the service
// self-healing for local dev.
export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export async function ping() {
  await pool.query('SELECT 1');
}
