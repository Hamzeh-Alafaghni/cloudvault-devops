import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFields, isImage, thumbnailKeyFor } from '../src/events.js';

test('parseFields turns a flat redis field array into an object', () => {
  const obj = parseFields(['type', 'file.uploaded', 'data', '{"x":1}']);
  assert.equal(obj.type, 'file.uploaded');
  assert.equal(obj.data, '{"x":1}');
});

test('isImage only matches image/* content types', () => {
  assert.ok(isImage('image/jpeg'));
  assert.ok(!isImage('text/plain'));
});

test('thumbnailKeyFor builds a stable key', () => {
  assert.equal(thumbnailKeyFor('abc'), 'thumbnails/abc.png');
});
