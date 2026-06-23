import { User } from "@isis/common/dto/user";
import { ID } from "@isis/common/utils/id";
import { sql, sqlOne } from "../../db/sql";

class UserRow {
  constructor(
    public id: number,
    public email: string,
    public name: string,
    public created_at: Date,
    public updated_at: Date,
  ) {}

  static toUser(row: UserRow): User {
    return {
      id: `id://User/${row.id}`,
      email: row.email,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export async function getUser(id: ID<"User">) {
  return await sqlOne<UserRow>`
    select id, email, name, created_at, updated_at from users where id = ${ID.parse(id).id};
  `;
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
  return await sql<UserRow>`
  select id, email, name, created_at, updated_at from users
  where true
  limit ${query.limit}
  offset ${query.offset};
  `;
}
