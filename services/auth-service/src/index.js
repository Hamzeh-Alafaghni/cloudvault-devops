import express from 'express';
import { pool, ensureSchema, ping } from './db.js';
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  validateCredentials,
} from './auth.js';

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3001);

// ---- Liveness: is the process up? (no dependency checks) ----
app.get('/healthz', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));

// ---- Readiness: can we serve traffic? (checks the DB) ----
app.get('/readyz', async (_req, res) => {
  try {
    await ping();
    res.json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not-ready', error: String(err.message || err) });
  }
});

// ---- POST /register ----
app.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  const errors = validateCredentials(email, password);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const hashed = hashPassword(password);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email.toLowerCase(), hashed]
    );
    const user = rows[0];
    return res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'email already registered' });
    }
    console.error('register failed', err);
    return res.status(500).json({ error: 'internal error' });
  }
});

// ---- POST /login ----
app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const { rows } = await pool.query(
      'SELECT id, email, password FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    return res.json({
      user: { id: user.id, email: user.email },
      token: signToken(user),
    });
  } catch (err) {
    console.error('login failed', err);
    return res.status(500).json({ error: 'internal error' });
  }
});

// ---- GET /verify ---- (used by the gateway to validate a bearer token)
app.get('/verify', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing bearer token' });
  try {
    const claims = verifyToken(token);
    return res.json({ valid: true, userId: claims.sub, email: claims.email });
  } catch {
    return res.status(401).json({ valid: false, error: 'invalid or expired token' });
  }
});

async function start() {
  await ensureSchema();
  app.listen(PORT, () => console.log(`auth-service listening on :${PORT}`));
}

start().catch((err) => {
  console.error('auth-service failed to start', err);
  process.exit(1);
});
