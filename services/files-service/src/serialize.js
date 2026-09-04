// Pure mapping from a DB row to the public API shape. Unit-tested.
export function toFileDTO(row) {
  return {
    id: row.id,
    userId: row.user_id,
    filename: row.filename,
    contentType: row.content_type,
    size: Number(row.size_bytes),
    hasThumbnail: Boolean(row.thumbnail_key),
    createdAt: row.created_at,
  };
}
