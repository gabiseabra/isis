import { BookInput } from "@isis/common/dto/book/input";
import { BookStatus } from "@isis/common/dto/book/status";
import { UUID } from "@isis/common/dto/uuid";
import { partition } from "@isis/common/utils/array";
import { never } from "@isis/common/utils/error";
import { hasNonNullableProperty } from "@isis/common/utils/guards";
import { NonEmpty } from "@isis/common/utils/non-empty";
import { bulkCreateAuthors } from "../authors/repo";
import { unit } from "../db/unit";
import { createPublisher } from "../publishers/repo";
import { DraftBookNotFound } from "./errors";
import {
  addBookAuthors,
  addBookLanguages,
  createBook,
  removeBookAuthors,
  removeBookLanguages,
  updateBook,
} from "./repo/books";
import { getDraftBook } from "./repo/drafts";

export async function applyDraftBook(
  uuid: UUID,
  overrides?: Partial<BookInput & { status: BookStatus }>,
) {
  const draft = (await getDraftBook(uuid)) ?? never(new DraftBookNotFound());

  return unit(async () => {
    const { publisher, authors, languages, ...input } = {
      ...draft.data,
      ...overrides,
    };

    const [publisherId, authorIds] = await Promise.all([
      !publisher
        ? undefined
        : (publisher.id ?? createPublisher(publisher).then((a) => a.id)),
      (async () => {
        const [authorIds, authorsToCreate] = partition(
          authors,
          hasNonNullableProperty("id"),
        );
        return [
          ...authorIds,
          ...(NonEmpty.isNonEmpty(authorsToCreate)
            ? await bulkCreateAuthors(
                NonEmpty.map(authorsToCreate, (author) => ({
                  name: author.name,
                  imageUrl: author.imageUrl ?? null,
                  countryCode: author.countryCode ?? null,
                  birthYear: author.birthYear ?? null,
                  deathYear: author.deathYear ?? null,
                })),
              )
            : []),
        ].map((a) => a.id);
      })(),
    ]);

    const book = await (draft.data.bookId
      ? updateBook({
          id: draft.data.bookId,
          publisherId,
          ...input,
        })
      : createBook({
          publisherId,
          status: "unpublished",
          ...input,
        }));

    await Promise.all([
      removeBookLanguages(book.id).then(() =>
        NonEmpty.isNonEmpty(languages)
          ? addBookLanguages(book.id, languages)
          : [],
      ),
      removeBookAuthors(book.id).then(() =>
        NonEmpty.isNonEmpty(authorIds)
          ? addBookAuthors(book.id, authorIds)
          : [],
      ),
    ]);

    return {
      ...book,
      languages,
      authorIds,
    };
  });
}
