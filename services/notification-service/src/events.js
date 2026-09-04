// Pure helpers. Unit-tested (no Redis, no DB).
export function parseFields(fields) {
  const obj = {};
  for (let i = 0; i < fields.length; i += 2) obj[fields[i]] = fields[i + 1];
  return obj;
}

// Human-readable notification text for a given event type + payload.
export function messageFor(type, data) {
  switch (type) {
    case 'file.uploaded':
      return `Uploaded "${data.filename}"`;
    case 'thumbnail.created':
      return `Thumbnail ready for your file`;
    default:
      return `Event: ${type}`;
  }
}

export const SUBSCRIBED_TYPES = ['file.uploaded', 'thumbnail.created'];
