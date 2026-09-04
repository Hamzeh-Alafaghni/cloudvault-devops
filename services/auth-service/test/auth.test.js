import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  validateCredentials,
} from '../src/auth.js';

test('password hashing round-trips', () => {
  const hash = hashPassword('correct horse battery');
  assert.notEqual(hash, 'correct horse battery');
  assert.ok(verifyPassword('correct horse battery', hash));
  assert.ok(!verifyPassword('wrong password', hash));
});

test('JWT sign + verify carries the user id as sub', () => {
  const token = signToken({ id: 'user-123', email: 'a@b.com' });
  const claims = verifyToken(token);
  assert.equal(claims.sub, 'user-123');
  assert.equal(claims.email, 'a@b.com');
});

test('verifyToken rejects tampered tokens', () => {
  const token = signToken({ id: 'x', email: 'x@y.com' });
  assert.throws(() => verifyToken(token + 'tampered'));
});

test('validateCredentials flags bad email and short password', () => {
  assert.deepEqual(validateCredentials('a@b.com', 'longenough'), []);
  const errs = validateCredentials('not-an-email', 'short');
  assert.equal(errs.length, 2);
});
