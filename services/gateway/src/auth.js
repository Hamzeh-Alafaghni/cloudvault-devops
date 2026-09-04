// Pure bearer-token verification. Unit-tested (sign in the test, verify here).
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-super-secret-change-me';

export function extractBearer(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim() || null;
}

// Returns { userId, email } or throws if the token is missing/invalid/expired.
export function verifyBearer(authHeader) {
  const token = extractBearer(authHeader);
  if (!token) throw new Error('missing bearer token');
  const claims = jwt.verify(token, SECRET);
  return { userId: claims.sub, email: claims.email };
}
