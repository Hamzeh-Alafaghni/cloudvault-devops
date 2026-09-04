// Thin client for the CloudVault gateway. Everything goes through the gateway
// (the single public entry point) — the browser never talks to a service directly.
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function asJson(res) {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error || body.detail || `request failed (${res.status})`);
  return body;
}

export async function register(email, password) {
  return asJson(
    await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  );
}

export async function login(email, password) {
  return asJson(
    await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  );
}

export async function listFiles(token) {
  return asJson(await fetch(`${BASE}/files`, { headers: authHeaders(token) }));
}

export async function getFile(token, id) {
  return asJson(await fetch(`${BASE}/files/${id}`, { headers: authHeaders(token) }));
}

export async function uploadFile(token, file) {
  const form = new FormData();
  form.append('file', file);
  return asJson(
    await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: authHeaders(token),
      body: form,
    })
  );
}

export async function listNotifications(token) {
  return asJson(await fetch(`${BASE}/notifications`, { headers: authHeaders(token) }));
}
