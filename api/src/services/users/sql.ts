import { User } from "@isis/common/dto/user";
import { ID } from "@isis/common/utils/id";
import { sql, sqlOne } from "../../db/sql";

type UserRow = {
  id: number;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

function mapUser(row: UserRow): User {
  return {
    ...row,
    id: `id://User/${row.id}`,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUser(id: ID<"User">) {
  const row = await sqlOne<UserRow>`
    select * from users where id = ${ID.parse(id).id};
  `;
  return mapUser(row);
}

export async function queryUsers(query: {
  offset: number;
  limit: number;
  // like query on name, email
  query?: string;
  ids?: ID<"User">[];
  name?: string;
  email?: string;
}) {
  const rows = await sql<UserRow>`
  select * from users
  where 1
  limit ${query.limit}
  offset ${query.offset};
  `;
  return rows.map(mapUser);
}
