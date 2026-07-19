import { Author } from "@isis/common/dto/author";
import { ID } from "@isis/common/utils/id";
import { sql, sqlOne, sqlOneMaybe } from "../../db/sql";

class AuthorRow {
  constructor(
    public id: number,
    public name: string,
    public image_url: string | null,
    public country_code: string | null,
    public birth_year: number | null,
    public death_year: number | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapAuthor(row: AuthorRow): Author {
  return {
    id: ID.create("Author", row.id),
    name: row.name,
    imageUrl: row.image_url ?? undefined,
    countryCode: row.country_code ?? undefined,
    birthYear: row.birth_year ?? undefined,
    deathYear: row.death_year ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createAuthor(input: {
  name: string;
  imageUrl?: string;
  countryCode?: string;
  birthYear?: number;
  deathYear?: number;
}) {
  const row = await sqlOne<AuthorRow>`
    insert into authors (name, image_url, country_code, birth_year, death_year)
    values (${input.name}, ${input.imageUrl ?? null}, ${input.countryCode ?? null}, ${input.birthYear ?? null}, ${input.deathYear ?? null})
    returning *;
    `;

  return mapAuthor(row);
}

export async function updateAuthor(input: {
  id: number;
  name: string;
  imageUrl?: string;
  countryCode?: string;
  birthYear?: number;
  deathYear?: number;
}) {
  const row = await sqlOneMaybe<AuthorRow>`
    update authors
    set name = ${input.name},
      image_url = ${input.imageUrl ?? null},
      country_code = ${input.countryCode ?? null},
      birth_year = ${input.birthYear ?? null},
      death_year = ${input.deathYear ?? null},
      updated_at = now()
    where id = ${input.id}
    returning *;
    `;

  return row ? mapAuthor(row) : null;
}

export async function getAuthor(id: number) {
  const row = await sqlOneMaybe<AuthorRow>`
    select * from authors
    where id = ${id};
    `;

  return row ? mapAuthor(row) : null;
}

export async function queryAuthors(query: {
  offset: number;
  limit: number;
  query?: string;
  ids?: number[];
  name?: string;
  countryCode?: string;
  birthYear?: number;
  deathYear?: number;
  sort?: "name" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}) {
  const sort = query.sort ?? "name";
  const order = query.order ?? "asc";

  const rows = await sql<AuthorRow>`
    select * from authors
    where concat_ws(' ', name) ilike coalesce('%' || ${query.query ?? null} || '%', '%')
      and id = any(coalesce(${(query.ids ?? null) as number[]}::bigint[], array[id]))
      and name = coalesce(${query.name ?? null}, name)
      and country_code is not distinct from coalesce(${query.countryCode ?? null}, country_code)
      and birth_year is not distinct from coalesce(${query.birthYear ?? null}, birth_year)
      and death_year is not distinct from coalesce(${query.deathYear ?? null}, death_year)
    order by
      case when ${sort} = 'name' and ${order} = 'asc' then name end asc,
      case when ${sort} = 'name' and ${order} = 'desc' then name end desc,
      case when ${sort} = 'created_at' and ${order} = 'asc' then created_at end asc,
      case when ${sort} = 'created_at' and ${order} = 'desc' then created_at end desc,
      case when ${sort} = 'updated_at' and ${order} = 'asc' then updated_at end asc,
      case when ${sort} = 'updated_at' and ${order} = 'desc' then updated_at end desc,
      id asc
    limit ${query.limit}
    offset ${query.offset};
    `;

  return rows.map(mapAuthor);
}
