import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { verifyBearer } from './auth.js';

const app = express();
const PORT = Number(process.env.PORT || 8080);

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const UPLOAD_URL = process.env.UPLOAD_SERVICE_URL || 'http://upload-service:3003';
const FILES_URL = process.env.FILES_SERVICE_URL || 'http://files-service:3002';
const NOTIF_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004';

// ---- CORS ----
// The browser loads the SPA from a different origin (the web dev server) than
// this gateway, so the single public entry point handles cross-origin requests
// and preflight. Dev-grade (reflects any origin); tightening the allowed origins
// is a reasonable hardening task.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// http-proxy-middleware writes the downstream response headers, so re-assert the
// CORS origin on proxied responses too.
const addCorsToProxyRes = (proxyRes, req) => {
  proxyRes.headers['access-control-allow-origin'] = req.headers.origin || '*';
  proxyRes.headers['vary'] = 'Origin';
};

// ---- Health (the gateway is what an ingress / load balancer probes) ----
app.get('/healthz', (_req, res) => res.json({ status: 'ok', service: 'gateway' }));

app.get('/readyz', async (_req, res) => {
  const targets = { auth: AUTH_URL, files: FILES_URL, upload: UPLOAD_URL, notification: NOTIF_URL };
  const checks = {};
  await Promise.all(
    Object.entries(targets).map(async ([name, url]) => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 2000);
        const r = await fetch(`${url}/healthz`, { signal: ctrl.signal });
        clearTimeout(t);
        checks[name] = r.ok ? 'ok' : `status ${r.status}`;
      } catch (e) {
        checks[name] = String(e.message || e);
      }
    })
  );
  const ready = Object.values(checks).every((v) => v === 'ok');
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not-ready', checks });
});

app.get('/', (_req, res) =>
  res.json({
    service: 'CloudVault API gateway',
    routes: {
      'POST /auth/register': 'public',
      'POST /auth/login': 'public',
      'GET /auth/verify': 'public',
      'POST /upload': 'JWT required',
      'GET /files, GET /files/:id': 'JWT required',
      'GET /notifications': 'JWT required',
    },
  })
);

// ---- Authn middleware for protected route prefixes ----
// Verifies the JWT locally and stamps a trusted x-user-id for downstream
// services. Any client-supplied x-user-id is ignored/overwritten.
function requireAuth(req, res, next) {
  try {
    const { userId } = verifyBearer(req.headers.authorization);
    req.userId = userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'unauthorized', detail: String(err.message || err) });
  }
}
app.use('/upload', requireAuth);
app.use('/files', requireAuth);
app.use('/notifications', requireAuth);

const injectUser = (proxyReq, req) => {
  if (req.userId) proxyReq.setHeader('x-user-id', req.userId);
};

// ---- Reverse-proxy routing (mounted at root so full paths pass through) ----
// /auth/* is public; the auth-service exposes /register etc., so strip /auth.
app.use(
  createProxyMiddleware('/auth', {
    target: AUTH_URL,
    changeOrigin: true,
    pathRewrite: { '^/auth': '' },
    onProxyRes: addCorsToProxyRes,
  })
);
app.use(
  createProxyMiddleware('/upload', {
    target: UPLOAD_URL,
    changeOrigin: true,
    onProxyReq: injectUser,
    onProxyRes: addCorsToProxyRes,
  })
);
app.use(
  createProxyMiddleware('/files', {
    target: FILES_URL,
    changeOrigin: true,
    onProxyReq: injectUser,
    onProxyRes: addCorsToProxyRes,
  })
);
app.use(
  createProxyMiddleware('/notifications', {
    target: NOTIF_URL,
    changeOrigin: true,
    onProxyReq: injectUser,
    onProxyRes: addCorsToProxyRes,
  })
);

app.listen(PORT, () => console.log(`gateway listening on :${PORT}`));
