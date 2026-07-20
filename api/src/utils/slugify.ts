import slug from "limax";

export function slugify(string: string) {
  return slug(string, { tone: false });
}
