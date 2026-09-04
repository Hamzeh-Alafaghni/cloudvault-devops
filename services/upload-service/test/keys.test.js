import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeFilename, uploadKey, isImage } from '../src/keys.js';

test('sanitizeFilename strips unsafe characters', () => {
  assert.equal(sanitizeFilename('../../etc/passwd'), '.._.._etc_passwd');
  assert.equal(sanitizeFilename('my file (1).PNG'), 'my_file__1_.PNG');
  assert.equal(sanitizeFilename(''), 'file');
});

test('uploadKey namespaces by file id', () => {
  assert.equal(uploadKey('abc', 'cat.png'), 'uploads/abc/cat.png');
});

test('isImage detects image content types', () => {
  assert.ok(isImage('image/png'));
  assert.ok(!isImage('application/pdf'));
  assert.ok(!isImage(undefined));
});
