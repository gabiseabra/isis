import { BookPage } from "@isis/common/dto/book/page";
import { BookPageInput } from "@isis/common/dto/book/page/input";
import { QueryBookPagesInput } from "@isis/common/dto/book/page/query-input";
import { WithNonNullable, WithRequired } from "@isis/common/types/object";
import { liftMaybe } from "@isis/common/utils/fp";
import { ID } from "@isis/common/utils/id";
import {
  createBatchedFunction,
  MAX_BATCH_SIZE,
} from "../../../utils/create-batched-function";
import { nest } from "../../db/nest";
import { sql, sqlOne } from "../../db/sql";

class BookPageRow {
  constructor(
    public id: number,
    public media_id: number,
    public book_id: number,
    public page_number: number,
    public page_type: string,
    public tags: string[],
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapBookPage(row: BookPageRow): BookPage {
  return {
    id: ID.create("BookPage", row.id),
    mediaId: ID.create("Media", row.media_id),
    bookId: ID.create("Book", row.book_id),
    pageNumber: row.page_number,
    pageType: row.page_type,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const getBookPage = createBatchedFunction(
  async (ids: ID<"BookPage">[]) => {
    const _ids = ids.map((id) => ID.parse(id).id);

    const rows = await sql<BookPageRow>`
      select *
      from book_pages
      where id = any(${_ids}::bigint[]);
    `;

    return _ids
      .map((id) => rows.find((row) => row.id === id) ?? null)
      .map(liftMaybe(mapBookPage));
  },
  { maxBatchSize: MAX_BATCH_SIZE.DB_QUERY },
);

export async function queryBookPages(query: QueryBookPagesInput) {
  const sort = query.sort ?? "page_number";
  const order = query.order ?? "asc";
  const ids = query.ids?.map((id) => ID.parse(id).id) ?? null;
  const bookId = query.bookId ? ID.parse(query.bookId).id : null;

  const rows = await sql<BookPageRow>`
    select *
    from book_pages
    where book_id = ${bookId}::bigint
      and id = any(coalesce(${ids as number[]}::bigint[], array[id]))
      and page_type = any(coalesce(${(query.types ?? null) as string[]}::varchar[], array[page_type]))
      and tags @> coalesce(${(query.tags ?? null) as string[]}::text[], array[]::text[])
      and page_number >= coalesce(${query.minPageNumber ?? null}, page_number)
      and page_number <= coalesce(${query.maxPageNumber ?? null}, page_number)
      and concat_ws(' ', page_number, page_type, array_to_string(tags, ' ')) ilike coalesce('%' || ${query.query ?? null} || '%', '%')
    order by
      case when ${sort} = 'page_number' and ${order} = 'asc' then page_number end asc,
      case when ${sort} = 'page_number' and ${order} = 'desc' then page_number end desc,
      case when ${sort} = 'created_at' and ${order} = 'asc' then created_at end asc,
      case when ${sort} = 'created_at' and ${order} = 'desc' then created_at end desc,
      case when ${sort} = 'updated_at' and ${order} = 'asc' then updated_at end asc,
      case when ${sort} = 'updated_at' and ${order} = 'desc' then updated_at end desc,
      id asc
    limit ${query.limit}
    offset ${query.offset};
  `;

  return rows.map(mapBookPage);
}

export async function countBookPages(
  query: Omit<QueryBookPagesInput, "page" | "limit" | "offset" | "sort">,
) {
  const ids = query.ids?.map((id) => ID.parse(id).id) ?? null;
  const bookId = query.bookId ? ID.parse(query.bookId).id : null;

  const row = await sqlOne<{ count: number }>`
    select count(*)::int as count
    from book_pages
    where book_id = ${bookId}::bigint
      and id = any(coalesce(${ids as number[]}::bigint[], array[id]))
      and page_type = any(coalesce(${(query.types ?? null) as string[]}::varchar[], array[page_type]))
      and tags @> coalesce(${(query.tags ?? null) as string[]}::text[], array[]::text[])
      and page_number >= coalesce(${query.minPageNumber ?? null}, page_number)
      and page_number <= coalesce(${query.maxPageNumber ?? null}, page_number)
      and concat_ws(' ', page_number, page_type, array_to_string(tags, ' ')) ilike coalesce('%' || ${query.query ?? null} || '%', '%');
  `;

  return row.count;
}

/// mutations

export const createBookPage = createBatchedFunction(
  async (inputs: Omit<BookPageInput, "id">[]) => {
    const { bookId, mediaId, pageNumber, pageType, tags } = nest(
      inputs.map((input) => ({
        ...input,
        bookId: input.bookId ? ID.toNumber(input.bookId) : null,
        mediaId: input.mediaId ? ID.toNumber(input.mediaId) : null,
        tags: JSON.stringify(input.tags),
      })),
    );

    const rows = await sql<BookPageRow>`
      insert into book_pages (book_id, media_id, page_number, page_type, tags)
      select
        input.id,
        input.media_id,
        input.page_number,
        input.page_type,
        array(select jsonb_array_elements_text(input.tags::jsonb))
      from unnest(
        ${bookId}::bigint[],
        ${mediaId}::bigint[],
        ${pageNumber}::int[],
        ${pageType}::varchar[],
        ${tags}::text[]
      ) as input(id, media_id, page_number, page_type, tags)
      returning *;
    `;

    return rows.map(mapBookPage);
  },
  { maxBatchSize: MAX_BATCH_SIZE.DB_MUTATION },
);

export const updateBookPage = createBatchedFunction(
  async (inputs: WithNonNullable<BookPageInput, "id">[]) => {
    const { id, bookId, mediaId, pageNumber, pageType, tags } = nest(
      inputs.map((input) => ({
        ...input,
        id: ID.toNumber(input.id),
        bookId: input.bookId ? ID.toNumber(input.bookId) : null,
        mediaId: input.mediaId ? ID.toNumber(input.mediaId) : null,
        tags: JSON.stringify(input.tags),
      })),
    );

    const rows = await sql<BookPageRow>`
      update book_pages
      set book_id = input.book_id,
        media_id = input.media_id,
        page_number = input.page_number,
        page_type = input.page_type,
        tags = array(select jsonb_array_elements_text(input.tags::jsonb)),
        updated_at = now()
      from unnest(
        ${id}::bigint[],
        ${bookId}::bigint[],
        ${mediaId}::bigint[],
        ${pageNumber}::int[],
        ${pageType}::varchar[],
        ${tags}::text[]
      ) as input(id, book_id, media_id, page_number, page_type, tags)
      where book_pages.id = input.id
      returning book_pages.*;
    `;

    return rows.map(mapBookPage);
  },
  { maxBatchSize: MAX_BATCH_SIZE.DB_MUTATION },
);

export async function deleteBookPages(
  bookId: ID<"Book">,
  pageIds?: ID<"BookPage">[],
) {
  const ids = pageIds?.map((id) => ID.parse(id).id) ?? null;
  const row = await sqlOne<BookPageRow>`
    delete from book_pages
    where book_id = ${ID.parse(bookId).id}::bigint
      and id = any(coalesce(${ids as number[]}::bigint[], array[id]))
    returning *;
  `;
  return mapBookPage(row);
}
