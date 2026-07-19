import { User } from "@isis/common/dto/user";
import { ID } from "@isis/common/utils/id";
import { sql, sqlOne, sqlOneMaybe } from "../../db/sql";

class UserRow {
  constructor(
    public id: number,
    public email: string,
    public name: string,
    public password_hash: string | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapUser(row: UserRow): User {
  return {
    id: ID.create("User", row.id),
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const row = await sqlOne<UserRow>`
    insert into users (name, email, password_hash)
    values (${input.name}, ${input.email}, ${input.passwordHash})
    returning *;
    `;

  return mapUser(row);
}

export async function getUser(id: ID<"User">) {
  const row = await sqlOne<UserRow>`
    select * from users
    where id = ${ID.parse(id).id};
    `;

  return mapUser(row);
}

export async function queryUsers(query: {
  offset: number;
  limit: number;
  query?: string;
  ids?: number[];
  name?: string;
  email?: string;
}) {
  const rows = await sql<UserRow>`
    select * from users
    where concat_ws(' ', name, email) ilike coalesce('%' || ${query.query ?? null}  || '%', '%')
      and id = any(coalesce(${(query.ids ?? null) as number[]}::bigint[], array[id]))
      and name = coalesce(${query.name ?? null}, name)
      and email = coalesce(${query.email ?? null}, email)
    limit ${query.limit}
    offset ${query.offset};
    `;

  return rows.map(mapUser);
}

export async function getUserPasswordHash(
  query: { id: ID<"User"> } | { email: string },
) {
  const row = await sqlOneMaybe<{ id: number; password_hash: string | null }>`
    select id, password_hash from users
    where id = coalesce(${"id" in query ? ID.parse(query.id).id : null}, id)
      and email = coalesce(${"email" in query ? query.email : null}, email);
    `;

  return row
    ? {
        id: ID.create("User", row.id),
        passwordHash: row.password_hash,
      }
    : null;
}

export async function updateUserPasswordHash(input: {
  id: ID<"User">;
  passwordHash: string;
}) {
  await sql`
    update users
    set password_hash = ${input.passwordHash}
    where id = ${ID.parse(input.id).id};
    `;
}
