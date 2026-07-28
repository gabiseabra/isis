/**
 * Escape special characters in a string for use in a LIKE query.
 */
export function escapeLike(pattern: string) {
  return pattern.replace(/[%_]/g, "\\$&");
}
