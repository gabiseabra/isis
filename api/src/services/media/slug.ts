import { MediaInput } from "@isis/common/dto/media/input";
import { slugify } from "../../utils/slugify";
import { queryMediaEntry } from "./repo";

export async function getAvailableMediaSlug(
  input: Pick<MediaInput, "name" | "slug" | "parentId">,
) {
  const slug = input.slug ?? slugify(input.name);

  const entries = await queryMediaEntry({
    query: `slug ^= "${slug}"`,
    parentId: input.parentId,
  });

  const numericSuffixes = entries
    .map((entry) => entry.slug.slice(slug.length + 1) || "0")
    .map((suffix) => parseInt(suffix, 10))
    .filter((num) => !isNaN(num));

  if (entries.length === 0) return slug;
  return `${slug}-${Math.max(0, ...numericSuffixes) + 1}`;
}
