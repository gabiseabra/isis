import { DraftBook, DraftBookResult } from "@isis/common/dto/book/draft";
import { UUID } from "@isis/common/dto/uuid";
import { ID } from "@isis/common/utils/id";
import { parseObject } from "@isis/common/utils/parse-object";
import { sqlOne, sqlOneMaybe } from "../../db/sql";

class DraftBookRow {
  constructor(
    public uuid: UUID,
    public book_id: number | null,
    public title: string,
    public slug: string | null,
    public tags: string[],
    public isbn13: string | null,
    public isbn10: string | null,
    public image_url: string | null,
    public publish_year: number | null,
    public publisher: unknown,
    public authors: unknown,
    public languages: string[],
    public deleted_at: Date | null,
    public applied_at: Date | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapDraftBook(row: DraftBookRow): DraftBookResult {
  return parseObject(
    DraftBook,
    {
      uuid: row.uuid,
      bookId: row.book_id !== null ? ID.create("Book", row.book_id) : undefined,
      title: row.title,
      slug: row.slug ?? undefined,
      tags: row.tags ?? [],
      isbn13: row.isbn13 ?? undefined,
      isbn10: row.isbn10 ?? undefined,
      imageUrl: row.image_url ?? undefined,
      languages: row.languages,
      publishYear: row.publish_year ?? undefined,
      publisher: undefined,
      authors: [],
      deletedAt: row.deleted_at ?? undefined,
      appliedAt: row.applied_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    {
      publisher: row.publisher ?? undefined,
      authors: row.authors,
    },
  );
}

export async function getActiveDraftBook(bookId: ID<"Book">) {
  const row = await sqlOneMaybe<DraftBookRow>`
  select *
  from draft_books
  where book_id = ${ID.parse(bookId).id}
    and deleted_at is null
    and applied_at is null
  `;
  return row ? mapDraftBook(row) : null;
}

export async function getDraftBook(uuid: UUID) {
  const row = await sqlOneMaybe<DraftBookRow>`
  select *
  from draft_books
  where uuid = ${uuid}
  `;
  return row ? mapDraftBook(row) : null;
}

export async function upsertDraftBook(input: {
  uuid?: UUID;
  bookId?: ID<"Book">;
  title?: string;
  slug?: string;
  tags?: string[];
  isbn13?: string;
  isbn10?: string;
  imageUrl?: string;
  publishYear?: number;
  publisher?: DraftBook["publisher"];
  authors?: DraftBook["authors"];
  languages?: string[];
  appliedAt?: Date;
  deletedAt?: Date;
}) {
  const uuid: string | null = input.uuid ?? null;
  const bookId = input.bookId ? ID.parse(input.bookId).id : null;
  const appliedAt = input.appliedAt?.toISOString() ?? null;
  const deletedAt = input.deletedAt?.toISOString() ?? null;
  const publisher: unknown = JSON.stringify(input.publisher ?? null);
  const authors: unknown = JSON.stringify(input.authors ?? null);

  const row = await sqlOne<DraftBookRow>`
  insert into draft_books (
    uuid,
    book_id,
    title,
    slug,
    tags,
    isbn13,
    isbn10,
    image_url,
    publish_year,
    publisher,
    authors,
    languages,
    applied_at,
    deleted_at
  )
  values (
    coalesce(
      ${uuid}::uuid,
      (
        select uuid
        from draft_books
        where book_id is not distinct from ${bookId}
          and applied_at is null
          and deleted_at is null
        order by updated_at desc
        limit 1
      ),
      uuid_generate_v4()
    ),
    ${bookId},
    ${input.title ?? null},
    ${input.slug ?? null},
    ${input.tags ?? []},
    ${input.isbn13 ?? null},
    ${input.isbn10 ?? null},
    ${input.imageUrl ?? null},
    ${input.publishYear ?? null},
    ${publisher}::jsonb,
    ${authors}::jsonb,
    ${input.languages ?? []},
    ${appliedAt}::timestamptz,
    ${deletedAt}::timestamptz
  )
  on conflict (uuid) do update
  set book_id = case when ${!("bookId" in input)} then draft_books.book_id else excluded.book_id end,
    title = case when ${!("title" in input)} then draft_books.title else excluded.title end,
    slug = case when ${!("slug" in input)} then draft_books.slug else excluded.slug end,
    tags = case when ${!("tags" in input)} then draft_books.tags else excluded.tags end,
    isbn13 = case when ${!("isbn13" in input)} then draft_books.isbn13 else excluded.isbn13 end,
    isbn10 = case when ${!("isbn10" in input)} then draft_books.isbn10 else excluded.isbn10 end,
    image_url = case when ${!("imageUrl" in input)} then draft_books.image_url else excluded.image_url end,
    publish_year = case when ${!("publishYear" in input)} then draft_books.publish_year else excluded.publish_year end,
    publisher = case when ${!("publisher" in input)} then draft_books.publisher else excluded.publisher end,
    authors = case when ${!("authors" in input)} then draft_books.authors else excluded.authors end,
    languages = case when ${!("languages" in input)} then draft_books.languages else excluded.languages end,
    applied_at = case when ${!("appliedAt" in input)} then draft_books.applied_at else excluded.applied_at end,
    deleted_at = case when ${!("deletedAt" in input)} then draft_books.deleted_at else excluded.deleted_at end,
    updated_at = now()
  returning *
  `;
  return mapDraftBook(row);
}
