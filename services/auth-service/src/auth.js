// Pure auth helpers — deliberately dependency-light and unit-testable
// (no DB, no network). See test/auth.test.js.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-super-secret-change-me';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

export function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}

export function signToken(user) {
  // Keep the claim set small: id + email is enough for downstream services.
  return jwt.sign({ sub: user.id, email: user.email }, SECRET, {
    expiresIn: EXPIRES_IN,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

// Very small guard so we don't persist obviously-bad input.
export function validateCredentials(email, password) {
  const errors = [];
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errors.push('a valid email is required');
  }
  if (!password || password.length < 8) {
    errors.push('password must be at least 8 characters');
  }
  return errors;
}
