import { Publisher } from "@isis/common/dto/publisher";
import { ID } from "@isis/common/utils/id";
import { sql, sqlOne, sqlOneMaybe } from "../../db/sql";

class PublisherRow {
  constructor(
    public id: number,
    public name: string,
    public country_code: string | null,
    public image_url: string | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapPublisher(row: PublisherRow): Publisher {
  return {
    id: ID.create("Publisher", row.id),
    name: row.name,
    imageUrl: row.image_url ?? undefined,
    countryCode: row.country_code ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createPublisher(input: {
  name: string;
  imageUrl?: string;
  countryCode?: string;
}) {
  const row = await sqlOne<PublisherRow>`
    insert into publishers (name, image_url, country_code)
    values (${input.name}, ${input.imageUrl ?? null}, ${input.countryCode ?? null})
    returning *;
    `;

  return mapPublisher(row);
}

export async function updatePublisher(input: {
  id: ID<"Publisher">;
  name: string;
  imageUrl?: string;
  countryCode?: string;
}) {
  const row = await sqlOneMaybe<PublisherRow>`
    update publishers
    set name = ${input.name},
      image_url = ${input.imageUrl ?? null},
      country_code = ${input.countryCode ?? null},
      updated_at = now()
    where id = ${ID.parse(input.id).id}
    returning *;
    `;

  return row ? mapPublisher(row) : null;
}

export async function getPublisher(id: number) {
  const row = await sqlOneMaybe<PublisherRow>`
    select * from publishers
    where id = ${id};
    `;

  return row ? mapPublisher(row) : null;
}

export async function queryPublishers(query: {
  offset: number;
  limit: number;
  query?: string;
  ids?: number[];
  name?: string;
  sort?: "name" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}) {
  const sort = query.sort ?? "name";
  const order = query.order ?? "asc";

  const rows = await sql<PublisherRow>`
    select * from publishers
    where concat_ws(' ', name) ilike coalesce('%' || ${query.query ?? null} || '%', '%')
      and id = any(coalesce(${(query.ids ?? null) as number[]}::bigint[], array[id]))
      and name = coalesce(${query.name ?? null}, name)
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

  return rows.map(mapPublisher);
}
