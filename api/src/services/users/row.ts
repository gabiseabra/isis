import { User } from "@isis/common/dto/user";
import { ID } from "@isis/common/utils/id";
import { sql, sqlOne } from "../../db/sql";

export class UserRow {
  constructor(
    public id: number,
    public email: string,
    public name: string,
    public password_hash: string | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}

  static toJson(row: UserRow): User {
    return {
      id: ID.create("User", row.id),
      email: row.email,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async create(input: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return await sqlOne<UserRow>`
    insert into users (name, email, password_hash)
    values (${input.name}, ${input.email}, ${input.passwordHash})
    returning *;
    `;
  }

  static async get(id: number) {
    return await sqlOne<UserRow>`
    select * from users
    where id = ${id};
    `;
  }

  static async query(query: {
    offset: number;
    limit: number;
    // like query on name, email
    query?: string;
    ids?: number[];
    name?: string;
    email?: string;
  }) {
    return await sql<UserRow>`
    select * from users
    where concat_ws(' ', name, email) ilike coalesce('%' || ${query.query ?? null}  || '%', '%')
      and id = any(coalesce(${(query.ids ?? null) as number[]}::bigint[], array[id]))
      and name = coalesce(${query.name ?? null}, name)
      and email = coalesce(${query.email ?? null}, email)
    limit ${query.limit}
    offset ${query.offset};
    `;
  }

  static async updatePasswordHash(input: { id: number; passwordHash: string }) {
    await sql`
    update users
    set password_hash = ${input.passwordHash}
    where id = ${input.id};
    `;
  }
}
