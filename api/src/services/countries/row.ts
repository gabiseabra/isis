import { Country } from "@isis/common/dto/country";
import { sql } from "../../db/sql";

export class CountryRow {
  constructor(
    public code: string,
    public name: string,
    public created_at: Date,
  ) {}

  static toJson(row: CountryRow): Country {
    return {
      code: row.code,
      name: row.name,
    };
  }

  static async query(query: { offset: number; limit: number; query?: string }) {
    return await sql<CountryRow>`
    select * from countries
    where concat_ws(' ', code, name) ilike coalesce('%' || ${query.query ?? null}  || '%', '%')
    limit ${query.limit}
    offset ${query.offset};
    `;
  }
}
