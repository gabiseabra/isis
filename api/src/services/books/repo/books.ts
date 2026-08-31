import { Book } from "@isis/common/dto/book";
import { BookInput } from "@isis/common/dto/book/input";
import { QueryBooksInput } from "@isis/common/dto/book/query-input";
import { BookStatus } from "@isis/common/dto/book/status";
import { WithNonNullable } from "@isis/common/types/object";
import { ID } from "@isis/common/utils/id";
import { sql, sqlOne, sqlOneMaybe } from "../../db/sql";

class BookRow {
  constructor(
    public id: number,
    public title: string,
    public status: BookStatus,
    public slug: string | null,
    public isbn: string | null,
    public image_url: string | null,
    public publish_year: number | null,
    public publisher_id: number | null,
    public author_ids: number[] | null,
    public languages: string[] | null,
    public tags: string[],
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapBook(row: BookRow): Book {
  return {
    id: ID.create("Book", row.id),
    status: row.status,
    title: row.title,
    slug: row.slug ?? undefined,
    isbn: row.isbn ?? undefined,
    imageUrl: row.image_url ?? undefined,
    publishYear: row.publish_year ?? undefined,
    publisherId:
      row.publisher_id !== null
        ? ID.create("Publisher", row.publisher_id)
        : undefined,
    authorIds: (row.author_ids ?? []).map((id) => ID.create("Author", id)),
    languages: row.languages ?? [],
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getBook(id: ID<"Book">) {
  const row = await sqlOneMaybe<BookRow>`
    select b.*,
      array_agg(distinct coalesce(ba.author_id::int, 0)) filter (where ba.author_id is not null) as author_ids,
      array_agg(distinct coalesce(bl.language_code::text, '')) filter (where bl.language_code is not null) as languages
    from books b
    left join book_authors ba on ba.book_id = b.id
    left join book_languages bl on bl.book_id = b.id
    where b.id = ${ID.parse(id).id}
    group by b.id;
    `;
  return row ? mapBook(row) : null;
}

export async function queryBooks(query: QueryBooksInput) {
  const sort = query.sort ?? "name";
  const order = query.order ?? "asc";
  const ids = query.ids?.map(ID.toNumber) ?? null;

  const rows = await sql<BookRow>`
    select b.*,
      array_agg(distinct coalesce(ba.author_id::int, 0)) filter (where ba.author_id is not null) as author_ids,
      array_agg(distinct coalesce(bl.language_code::text, '')) filter (where bl.language_code is not null) as languages
    from books b
    left join book_authors ba on ba.book_id = b.id
    left join authors a on a.id = ba.author_id
    left join book_languages bl on bl.book_id = b.id
    left join publishers p on p.id = b.publisher_id
    where b.id = any(coalesce(${ids as number[]}, array[b.id]))
    group by b.id
    having concat_ws(' ',
        b.title, b.isbn,
        array_to_string(b.tags, ' '),
        string_agg(distinct a.name, ' '),
        string_agg(distinct p.name, ' ')
      ) ilike coalesce('%' || ${query.query ?? null} || '%', '%')
      and b.tags @> coalesce(${(query.tags ?? null) as string[]}, array[]::text[])
    order by
      case when ${sort} = 'name' and ${order} = 'asc' then b.title end asc,
      case when ${sort} = 'name' and ${order} = 'desc' then b.title end desc,
      case when ${sort} = 'created_at' and ${order} = 'asc' then b.created_at end asc,
      case when ${sort} = 'created_at' and ${order} = 'desc' then b.created_at end desc,
      case when ${sort} = 'updated_at' and ${order} = 'asc' then b.updated_at end asc,
      case when ${sort} = 'updated_at' and ${order} = 'desc' then b.updated_at end desc,
      b.id asc
    limit ${query.limit}
    offset ${query.offset};
    `;

  return rows.map(mapBook);
}

/// mutations

export async function createBook(
  input: Omit<BookInput, "id" | "languages" | "authors" | "publisher"> & {
    publisherId?: ID<"Publisher"> | null;
  },
) {
  const publisherId = input.publisherId ? ID.toNumber(input.publisherId) : null;

  const row = await sqlOne<BookRow>`
    insert into books (status, title, slug, isbn, image_url, publish_year, publisher_id, tags)
    values (
      ${input.status}::book_status,
      ${input.title},
      ${input.slug ?? null},
      ${input.isbn ?? null},
      ${input.imageUrl ?? null},
      ${input.publishYear ?? null},
      ${publisherId},
      ${input.tags}
    )
    returning *,
      array[]::int[] as author_ids,
      array[]::text[] as languages
    `;
  return mapBook(row);
}

export async function updateBook(
  input: WithNonNullable<
    Omit<BookInput, "languages" | "authors" | "publisher">,
    "id"
  > & {
    publisherId?: ID<"Publisher"> | null;
  },
) {
  const id = ID.toNumber(input.id);
  const publisherId = input.publisherId ? ID.toNumber(input.publisherId) : null;

  const row = await sqlOne<BookRow>`
    update books
    set status = ${input.status}::book_status,
      title = ${input.title},
      slug = ${input.slug ?? null},
      isbn = ${input.isbn ?? null},
      image_url = ${input.imageUrl ?? null},
      publish_year = ${input.publishYear ?? null},
      publisher_id = ${publisherId},
      tags = ${input.tags as string[]}::text[],
      updated_at = now()
    where id = ${id}
    returning *,
      array[]::int[] as author_ids,
      array[]::text[] as languages
    `;
  return mapBook(row);
}

/// relations: authors

export async function removeBookAuthors(
  bookId: ID<"Book">,
  authorIdsToDelete?: ID<"Author">[],
) {
  const authorIds = (authorIdsToDelete?.map((id) => ID.parse(id).id) ??
    null) as number[];
  await sql`
    delete from book_authors
    where book_id = ${ID.parse(bookId).id}
      and author_id = any(coalesce(${authorIds}, array[author_id]));
    `;
}

export async function addBookAuthors(
  bookId: ID<"Book">,
  authorIdsToCreate: ID<"Author">[],
) {
  const authorIds = (authorIdsToCreate?.map((id) => ID.parse(id).id) ??
    null) as number[];
  const rows = await sql<{ author_id: number }>`
    insert into book_authors (book_id, author_id)
    select ${ID.toNumber(bookId)}, *
    from unnest(${authorIds}::bigint[])
    on conflict do nothing
    returning author_id;
    `;
  return rows.map((row) => ID.create("Author", row.author_id));
}

/// relations: languages

export async function removeBookLanguages(
  bookId: ID<"Book">,
  langCodesToDelete?: string[],
) {
  await sql`
    delete from book_languages
    where book_id = ${ID.toNumber(bookId)}
      and language_code = any(coalesce(${(langCodesToDelete ?? null) as string[]}, array[language_code]));
    `;
}

export async function addBookLanguages(
  bookId: ID<"Book">,
  langCodesToCreate: string[],
) {
  const rows = await sql<{ language_code: string }>`
    insert into book_languages (book_id, language_code)
    select ${ID.toNumber(bookId)}, *
    from unnest(${langCodesToCreate}::char(2)[])
    on conflict do nothing
    returning language_code;
    `;
  return rows.map((row) => row.language_code);
}
