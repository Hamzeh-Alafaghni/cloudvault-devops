// Pure helpers for Redis Stream messages. Unit-tested (no Redis).

// Redis returns stream fields as a flat [k1, v1, k2, v2, ...] array.
export function parseFields(fields) {
  const obj = {};
  for (let i = 0; i < fields.length; i += 2) {
    obj[fields[i]] = fields[i + 1];
  }
  return obj;
}

export function isImage(contentType) {
  return typeof contentType === 'string' && contentType.startsWith('image/');
}

export function thumbnailKeyFor(fileId) {
  return `thumbnails/${fileId}.png`;
}
