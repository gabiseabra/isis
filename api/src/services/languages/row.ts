import { Language } from "@isis/common/dto/language";
import { sql } from "../../db/sql";

export class LanguageRow {
  constructor(
    public code: string,
    public name: string,
    public created_at: Date,
  ) {}

  static toJson(row: LanguageRow): Language {
    return {
      code: row.code,
      name: row.name,
    };
  }

  static async query(query: { offset: number; limit: number; query?: string }) {
    return await sql<LanguageRow>`
    select * from languages
    where concat_ws(' ', code, name) ilike coalesce('%' || ${query.query ?? null}  || '%', '%')
    limit ${query.limit}
    offset ${query.offset};
    `;
  }
}
