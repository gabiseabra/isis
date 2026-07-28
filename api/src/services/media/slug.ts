import { escapeLike } from "../../db/escape-like";
import { queryMediaEntry } from "./db";

export async function getAvailableMediaSlug(slug: string) {
  const entries = await queryMediaEntry({
    query: `slug:like:${JSON.stringify(`${escapeLike(slug)}%`)}`,
  });
  const numericSuffixes = entries
    .map((entry) => entry.slug.slice(slug.length + 1) || "0")
    .map((suffix) => parseInt(suffix, 10))
    .filter((num) => !isNaN(num));

  if (entries.length === 0) return slug;
  return `${slug}-${Math.max(0, ...numericSuffixes) + 1}`;
}
