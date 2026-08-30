import { DraftBookPage } from "@isis/common/dto/book/page/draft";
import { UUID } from "@isis/common/dto/uuid";
import { liftMaybe } from "@isis/common/utils/fp";
import { ID } from "@isis/common/utils/id";
import {
  MAX_BATCH_SIZE,
  createBatchedFunction,
} from "../../../utils/create-batched-function";
import { nest } from "../../db/nest";
import { sql, sqlOne } from "../../db/sql";

class DraftBookPageRow {
  constructor(
    public uuid: UUID,
    public draft_book_uuid: UUID,
    public media_id: number | null,
    public page_id: number | null,
    public page_number: number | null,
    public page_type: string | null,
    public tags: string[],
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapDraftBookPage(row: DraftBookPageRow): DraftBookPage {
  return {
    uuid: row.uuid,
    draftBookUuid: row.draft_book_uuid,
    mediaId:
      row.media_id !== null ? ID.create("Media", row.media_id) : undefined,
    pageId:
      row.page_id !== null ? ID.create("BookPage", row.page_id) : undefined,
    pageNumber: row.page_number ?? undefined,
    pageType: row.page_type ?? undefined,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const getActiveDraftBookPage = createBatchedFunction(
  async (ids: ID<"BookPage">[]) => {
    const _ids = ids.map(ID.toNumber);

    const rows = await sql<DraftBookPageRow>`
    select draft_book_pages.*
    from draft_book_pages
      join draft_books on draft_books.uuid = draft_book_pages.draft_book_uuid
    where draft_book_pages.page_id = any(${_ids}::bigint[])
      and draft_books.applied_at is null
    order by draft_book_pages.updated_at desc;
    `;

    return _ids
      .map((id) => rows.find((row) => row.page_id === id) ?? null)
      .map(liftMaybe(mapDraftBookPage));
  },
  { maxBatchSize: MAX_BATCH_SIZE.DB_QUERY },
);

export const getDraftBookPage = createBatchedFunction(
  async (uuids: UUID[]) => {
    const rows = await sql<DraftBookPageRow>`
    select *
    from draft_book_pages
    where uuid = any(${uuids}::uuid[]);
    `;

    return uuids
      .map((uuid) => rows.find((row) => row.uuid === uuid) ?? null)
      .map(liftMaybe(mapDraftBookPage));
  },
  { maxBatchSize: MAX_BATCH_SIZE.DB_QUERY },
);

export async function queryDraftBookPages(query: {
  offset: number;
  limit: number;
  query?: string;
  draftBookUuid?: UUID;
  bookId?: ID<"Book">;
  ids?: ID<"BookPage">[];
  types?: string[];
  tags?: string[];
  minPageNumber?: number;
  maxPageNumber?: number;
  sort?: "page_number" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}) {
  const sort = query.sort ?? "page_number";
  const order = query.order ?? "asc";
  const draftBookUuids = query.draftBookUuid ? [query.draftBookUuid] : [];
  const ids = query.ids?.map((id) => ID.parse(id).id) ?? [];
  const bookIds = query.bookId ? [ID.parse(query.bookId).id] : [];
  const types = query.types ?? [];
  const tags = query.tags ?? [];
  const minPageNumber = query.minPageNumber ?? null;
  const maxPageNumber = query.maxPageNumber ?? null;

  const rows = await sql<DraftBookPageRow>`
  select draft_book_pages.*
  from draft_book_pages
    join draft_books on draft_books.uuid = draft_book_pages.draft_book_uuid
  where (cardinality(${draftBookUuids}::uuid[]) = 0 or draft_book_pages.draft_book_uuid = any(${draftBookUuids}::uuid[]))
    and (cardinality(${bookIds}::bigint[]) = 0 or draft_books.book_id = any(${bookIds}::bigint[]))
    and (cardinality(${ids}::bigint[]) = 0 or draft_book_pages.page_id = any(${ids}::bigint[]))
    and (cardinality(${types}::varchar[]) = 0 or draft_book_pages.page_type = any(${types}::varchar[]))
    and draft_book_pages.tags @> ${tags}::text[]
    and (${minPageNumber}::int is null or draft_book_pages.page_number >= ${minPageNumber}::int)
    and (${maxPageNumber}::int is null or draft_book_pages.page_number <= ${maxPageNumber}::int)
    and concat_ws(' ', draft_book_pages.page_number, draft_book_pages.page_type, array_to_string(draft_book_pages.tags, ' ')) ilike coalesce('%' || ${query.query ?? null} || '%', '%')
  order by
    case when ${sort} = 'page_number' and ${order} = 'asc' then draft_book_pages.page_number end asc,
    case when ${sort} = 'page_number' and ${order} = 'desc' then draft_book_pages.page_number end desc,
    case when ${sort} = 'created_at' and ${order} = 'asc' then draft_book_pages.created_at end asc,
    case when ${sort} = 'created_at' and ${order} = 'desc' then draft_book_pages.created_at end desc,
    case when ${sort} = 'updated_at' and ${order} = 'asc' then draft_book_pages.updated_at end asc,
    case when ${sort} = 'updated_at' and ${order} = 'desc' then draft_book_pages.updated_at end desc,
    draft_book_pages.uuid asc
  limit ${query.limit}
  offset ${query.offset};
  `;

  return rows.map(mapDraftBookPage);
}

export async function countDraftBookPages(query: {
  draftBookUuid: UUID;
  query?: string;
  ids?: ID<"BookPage">[];
  types?: string[];
  tags?: string[];
  minPageNumber?: number;
  maxPageNumber?: number;
}) {
  const ids = query.ids?.map((id) => ID.parse(id).id) ?? [];
  const types = query.types ?? [];
  const tags = query.tags ?? [];
  const minPageNumber = query.minPageNumber ?? null;
  const maxPageNumber = query.maxPageNumber ?? null;

  const row = await sqlOne<{ count: number }>`
  select count(*)::int count
  from draft_book_pages
  where draft_book_uuid = ${query.draftBookUuid}
    and (cardinality(${ids}::bigint[]) = 0 or page_id = any(${ids}::bigint[]))
    and (cardinality(${types}::varchar[]) = 0 or page_type = any(${types}::varchar[]))
    and tags @> ${tags}::text[]
    and (${minPageNumber} is null or page_number >= ${minPageNumber})
    and (${maxPageNumber} is null or page_number <= ${maxPageNumber})
    and concat_ws(' ', page_number, page_type, array_to_string(tags, ' ')) ilike coalesce('%' || ${query.query ?? null} || '%', '%');
  `;

  return row.count;
}

/// mutations

export const upsertDraftBookPage = createBatchedFunction(
  async (
    inputs: {
      draftBookUuid: UUID;
      mediaId: ID<"Media"> | null;
      pageId: ID<"BookPage"> | null;
      pageNumber: number | null;
      pageType: string | null;
      tags: string[] | null;
    }[],
  ) => {
    const { draftBookUuid, mediaId, pageId, pageNumber, pageType, tags } = nest(
      inputs.map((input) => ({
        ...input,
        draftBookUuid: input.draftBookUuid,
        mediaId: input.mediaId ? ID.toNumber(input.mediaId) : null,
        pageId: input.pageId ? ID.toNumber(input.pageId) : null,
        tags: JSON.stringify(input.tags ?? []),
      })),
    );

    const rows = await sql<DraftBookPageRow>`
  insert into draft_book_pages (
    uuid,
    draft_book_uuid,
    media_id,
    page_id,
    page_number,
    page_type,
    tags
  )
  select
    coalesce(
      (
        select uuid
        from draft_book_pages
        where draft_book_uuid = input.draft_book_uuid
          and page_id is not distinct from input.page_id
        order by updated_at desc
        limit 1
      ),
      uuid_generate_v4()
    ),
    input.draft_book_uuid,
    input.media_id,
    input.page_id,
    input.page_number,
    input.page_type,
    array(select jsonb_array_elements_text(input.tags::jsonb))
  from unnest(
    ${draftBookUuid}::uuid[],
    ${mediaId}::bigint[],
    ${pageId}::bigint[],
    ${pageNumber}::int[],
    ${pageType}::varchar[],
    ${tags}::text[]
  ) input(
    draft_book_uuid,
    media_id,
    page_id,
    page_number,
    page_type,
    tags
  )
  on conflict (uuid) do update
  set draft_book_uuid = coalesce(excluded.draft_book_uuid, draft_book_pages.draft_book_uuid),
    media_id = coalesce(excluded.media_id, draft_book_pages.media_id),
    page_id = coalesce(excluded.page_id, draft_book_pages.page_id),
    page_number = coalesce(excluded.page_number, draft_book_pages.page_number),
    page_type = coalesce(excluded.page_type, draft_book_pages.page_type),
    tags = coalesce(excluded.tags, draft_book_pages.tags),
    updated_at = now()
  returning *
  `;

    return rows.map(mapDraftBookPage);
  },
  { maxBatchSize: MAX_BATCH_SIZE.DB_MUTATION },
);

export const deleteDraftBookPage = createBatchedFunction(
  async (uuids: UUID[]) => {
    const rows = await sql<DraftBookPageRow>`
  delete from draft_book_pages
  where uuid = any(${uuids}::uuid[])
  returning *
  `;

    return rows.map(mapDraftBookPage);
  },
  { maxBatchSize: MAX_BATCH_SIZE.DB_MUTATION },
);
