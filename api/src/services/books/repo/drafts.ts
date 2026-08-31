import { DraftBook } from "@isis/common/dto/book/draft";
import { UUID } from "@isis/common/dto/uuid";
import { liftMaybe } from "@isis/common/utils/fp";
import { ID } from "@isis/common/utils/id";
import { parseObject } from "@isis/common/utils/parse-object";
import {
  MAX_BATCH_SIZE,
  createBatchedFunction,
} from "../../../utils/create-batched-function";
import { nest } from "../../db/nest";
import { sql } from "../../db/sql";

class DraftBookRow {
  constructor(
    public uuid: UUID,
    public book_id: number | null,
    public title: string,
    public slug: string | null,
    public tags: string[],
    public isbn: string | null,
    public image_url: string | null,
    public publish_year: number | null,
    public publisher: unknown,
    public authors: unknown,
    public languages: string[],
    public applied_at: Date | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapDraftBook(row: DraftBookRow): DraftBook {
  return parseObject(
    DraftBook,
    {
      uuid: row.uuid,
      bookId: row.book_id !== null ? ID.create("Book", row.book_id) : undefined,
      title: row.title,
      slug: row.slug ?? undefined,
      tags: row.tags ?? [],
      isbn: row.isbn ?? undefined,
      imageUrl: row.image_url ?? undefined,
      languages: row.languages,
      publishYear: row.publish_year ?? undefined,
      publisher: undefined,
      authors: [],
      appliedAt: row.applied_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    {
      publisher: row.publisher ?? undefined,
      authors: row.authors ?? undefined,
    },
  ).data;
}

export const getActiveDraftBook = createBatchedFunction(
  async (bookIds: ID<"Book">[]) => {
    const _bookIds = bookIds.map((bookId) => ID.parse(bookId).id);

    const rows = await sql<DraftBookRow>`
      select *
      from draft_books
      where book_id = any(${_bookIds}::bigint[])
        and applied_at is null;
    `;

    return _bookIds
      .map((id) => rows.find((row) => row.book_id === id) ?? null)
      .map(liftMaybe(mapDraftBook));
  },
  { maxBatchSize: MAX_BATCH_SIZE.DB_QUERY },
);

export const getDraftBook = createBatchedFunction(
  async (uuids: UUID[]) => {
    const rows = await sql<DraftBookRow>`
      select *
      from draft_books
      where uuid = any(${uuids}::uuid[]);
    `;

    return uuids
      .map((uuid) => rows.find((row) => row.uuid === uuid) ?? null)
      .map(liftMaybe(mapDraftBook));
  },
  { maxBatchSize: MAX_BATCH_SIZE.DB_QUERY },
);

export const upsertDraftBook = createBatchedFunction(
  async (
    inputs: {
      uuid: UUID | null;
      bookId: ID<"Book"> | null;
      title: string | null;
      slug: string | null;
      tags: string[] | null;
      isbn: string | null;
      imageUrl: string | null;
      publishYear: number | null;
      publisher: Exclude<DraftBook["publisher"], undefined> | null;
      authors: Exclude<DraftBook["authors"], undefined>;
      languages: string[] | null;
      appliedAt: Date | null;
    }[],
  ) => {
    const {
      uuid,
      bookId,
      title,
      slug,
      tags,
      isbn,
      imageUrl,
      publishYear,
      publisher,
      authors,
      languages,
      appliedAt,
    } = nest(inputs);

    const rows = await sql<DraftBookRow>`
  insert into draft_books (
    uuid,
    book_id,
    title,
    slug,
    tags,
    isbn,
    image_url,
    publish_year,
    publisher,
    authors,
    languages,
    applied_at
  )
  select
    coalesce(input.uuid, active_draft.uuid, uuid_generate_v4()),
    input.book_id,
    input.title,
    input.slug,
    array(select jsonb_array_elements_text(input.tags::jsonb)),
    input.isbn,
    input.image_url,
    input.publish_year,
    input.publisher,
    input.authors,
    array(select jsonb_array_elements_text(input.languages::jsonb)),
    input.applied_at
  from unnest(
    ${uuid}::uuid[],
    ${bookId.map(liftMaybe(ID.toNumber))}::bigint[],
    ${title}::text[],
    ${slug}::varchar[],
    ${tags.map((tags) => JSON.stringify(tags))}::text[],
    ${isbn}::varchar[],
    ${imageUrl}::text[],
    ${publishYear}::smallint[],
    ${publisher.map((p) => JSON.stringify(p))}::jsonb[],
    ${authors.map((a) => JSON.stringify(a))}::jsonb[],
    ${languages.map((tags) => JSON.stringify(tags))}::text[],
    ${appliedAt as Date[]}::timestamptz[]
  ) as input(
    uuid,
    book_id,
    title,
    slug,
    tags,
    isbn,
    image_url,
    publish_year,
    publisher,
    authors,
    languages,
    applied_at
  )
  left join lateral (
    select uuid
    from draft_books
    where book_id is not distinct from input.book_id
      and applied_at is null
    order by updated_at desc
    limit 1
  ) active_draft on true
  on conflict (uuid) do update
  set book_id = coalesce(excluded.book_id, draft_books.book_id),
    title = coalesce(excluded.title, draft_books.title),
    slug = coalesce(excluded.slug, draft_books.slug),
    tags = coalesce(excluded.tags, draft_books.tags),
    isbn = coalesce(excluded.isbn, draft_books.isbn),
    image_url = coalesce(excluded.image_url, draft_books.image_url),
    publish_year = coalesce(excluded.publish_year, draft_books.publish_year),
    publisher = coalesce(excluded.publisher, draft_books.publisher),
    authors = coalesce(excluded.authors, draft_books.authors),
    languages = coalesce(excluded.languages, draft_books.languages),
    applied_at = coalesce(excluded.applied_at, draft_books.applied_at),
    updated_at = now()
  returning *
  `;

    return rows.map(mapDraftBook);
  },
  { maxBatchSize: MAX_BATCH_SIZE.DB_MUTATION },
);

export const deleteDraftBook = createBatchedFunction(
  async ([...uuids]: UUID[]) => {
    await sql<DraftBookRow>`
    delete from draft_books
    where uuid = any(${uuids}::uuid[])
    returning *
    `;

    return uuids.map(() => void {});
  },
  { maxBatchSize: MAX_BATCH_SIZE.DB_MUTATION },
);
