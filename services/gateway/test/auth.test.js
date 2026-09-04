import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { extractBearer, verifyBearer } from '../src/auth.js';

const SECRET = process.env.JWT_SECRET || 'dev-super-secret-change-me';

test('extractBearer pulls the token out of the header', () => {
  assert.equal(extractBearer('Bearer abc.def.ghi'), 'abc.def.ghi');
  assert.equal(extractBearer('Basic xyz'), null);
  assert.equal(extractBearer(undefined), null);
});

test('verifyBearer returns userId + email for a valid token', () => {
  const token = jwt.sign({ sub: 'u42', email: 'a@b.com' }, SECRET);
  const out = verifyBearer(`Bearer ${token}`);
  assert.equal(out.userId, 'u42');
  assert.equal(out.email, 'a@b.com');
});

test('verifyBearer throws on missing or invalid token', () => {
  assert.throws(() => verifyBearer(undefined));
  assert.throws(() => verifyBearer('Bearer not-a-real-token'));
});
