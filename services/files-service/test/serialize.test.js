import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toFileDTO } from '../src/serialize.js';

test('toFileDTO maps DB row to API shape and coerces types', () => {
  const dto = toFileDTO({
    id: 'f1',
    user_id: 'u1',
    filename: 'cat.png',
    content_type: 'image/png',
    size_bytes: '2048',
    thumbnail_key: 'thumbnails/f1.png',
    created_at: '2026-01-01T00:00:00Z',
  });
  assert.equal(dto.size, 2048);
  assert.equal(typeof dto.size, 'number');
  assert.equal(dto.hasThumbnail, true);
  assert.equal(dto.userId, 'u1');
});

test('toFileDTO reports hasThumbnail=false when no thumbnail key', () => {
  const dto = toFileDTO({
    id: 'f2', user_id: 'u1', filename: 'doc.pdf',
    content_type: 'application/pdf', size_bytes: 10, thumbnail_key: null,
    created_at: '2026-01-01T00:00:00Z',
  });
  assert.equal(dto.hasThumbnail, false);
});
