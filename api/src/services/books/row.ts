import { Book } from "@isis/common/dto/book";
import { ID } from "@isis/common/utils/id";
import { sql, sqlOne } from "../../db/sql";

export class BookRow {
  constructor(
    public id: number,
    public title: string,
    public slug: string,
    public isbn13: string | null,
    public isbn10: string | null,
    public image_url: string | null,
    public publish_year: number | null,
    public publisher_id: number | null,
    public created_by: number | null,
    public created_at: Date,
    public updated_at: Date,
    public author_ids: (number | null)[],
    public languages: (string | null)[],
    public tags: (string | null)[],
  ) {}

  static toJson(row: BookRow): Book {
    return {
      id: ID.create("Book", row.id),
      title: row.title,
      slug: row.slug,
      isbn13: row.isbn13 ?? undefined,
      isbn10: row.isbn10 ?? undefined,
      imageUrl: row.image_url ?? undefined,
      publishYear: row.publish_year ?? undefined,
      publisherId:
        row.publisher_id !== null
          ? ID.create("Publisher", row.publisher_id)
          : undefined,
      authorIds: row.author_ids
        .filter((id): id is number => id !== null)
        .map((id) => ID.create("Author", Number(id))),
      languages: row.languages.filter(
        (language): language is string => language !== null,
      ),
      tags: row.tags.filter((tag): tag is string => tag !== null),
      createdById:
        row.created_by !== null ? ID.create("User", row.created_by) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async get(id: number) {
    return await sqlOne<BookRow>`
    select b.*,
      coalesce(array_agg(distinct ba.author_id), array[]::bigint[]) as author_ids,
      coalesce(array_agg(distinct bl.language_code::text), array[]::text[]) as languages,
      coalesce(array_agg(distinct bt.tag::text), array[]::text[]) as tags
    from books b
    left join book_authors ba on ba.book_id = b.id
    left join book_languages bl on bl.book_id = b.id
    left join books_tags bt on bt.book_id = b.id
    where b.id = ${id}
    group by b.id;
    `;
  }

  static async query(query: {
    offset: number;
    limit: number;
    query?: string;
    ids?: number[];
    tags?: string[];
    sort?: "name" | "created_at" | "updated_at";
    order?: "asc" | "desc";
  }) {
    const sort = query.sort ?? "name";
    const order = query.order ?? "asc";

    return await sql<BookRow>`
    select b.*,
      coalesce(array_agg(distinct ba.author_id), array[]::bigint[]) as author_ids,
      coalesce(array_agg(distinct bl.language_code::text), array[]::text[]) as languages,
      coalesce(array_agg(distinct bt.tag::text), array[]::text[]) as tags
    from books b
    left join book_authors ba on ba.book_id = b.id
    left join authors a on a.id = ba.author_id
    left join book_languages bl on bl.book_id = b.id
    left join books_tags bt on bt.book_id = b.id
    left join publishers p on p.id = b.publisher_id
    where b.id = any(coalesce(${(query.ids ?? null) as number[]}::bigint[], array[b.id]))
    group by b.id
    having concat_ws(' ', b.title, b.isbn13, b.isbn10, string_agg(distinct bt.tag::text, ' '), string_agg(distinct a.name, ' '), string_agg(distinct p.name, ' ')) ilike coalesce('%' || ${query.query ?? null} || '%', '%')
      and coalesce(${(query.tags ?? null) as string[]}::text[] && coalesce(array_agg(distinct bt.tag::text) filter (where bt.tag is not null), array[]::text[]), true)
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
  }
}
