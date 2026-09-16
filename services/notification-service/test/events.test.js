import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseFields, messageFor, SUBSCRIBED_TYPES } from '../src/events.js';

test('notification schema enables pgcrypto before using gen_random_uuid()', () => {
  const dbSource = readFileSync(new URL('../src/db.js', import.meta.url), 'utf8');
  assert.match(dbSource, /CREATE EXTENSION IF NOT EXISTS pgcrypto/);
});

test('parseFields converts flat redis fields to an object', () => {
  const obj = parseFields(['type', 'thumbnail.created', 'data', '{}']);
  assert.equal(obj.type, 'thumbnail.created');
});

test('messageFor produces friendly text per event type', () => {
  assert.match(messageFor('file.uploaded', { filename: 'a.png' }), /Uploaded "a\.png"/);
  assert.match(messageFor('thumbnail.created', {}), /Thumbnail ready/);
  assert.match(messageFor('mystery', {}), /Event: mystery/);
});

test('service subscribes to both upload and thumbnail events', () => {
  assert.deepEqual(SUBSCRIBED_TYPES, ['file.uploaded', 'thumbnail.created']);
});
