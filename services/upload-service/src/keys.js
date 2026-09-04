// Pure helpers for building S3 object keys. Unit-tested (no AWS calls).
export function sanitizeFilename(name) {
  return (name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200) || 'file';
}

export function uploadKey(fileId, filename) {
  return `uploads/${fileId}/${sanitizeFilename(filename)}`;
}

export function isImage(contentType) {
  return typeof contentType === 'string' && contentType.startsWith('image/');
}
