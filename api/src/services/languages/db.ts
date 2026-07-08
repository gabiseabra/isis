import { Language } from "@isis/common/dto/language";
import { sql } from "../../db/sql";

class LanguageRow {
  constructor(
    public code: string,
    public name: string,
    public created_at: Date,
  ) {}
}

function mapLanguage(row: LanguageRow): Language {
  return {
    code: row.code,
    name: row.name,
  };
}

export async function queryLanguages(query: {
  offset: number;
  limit: number;
  query?: string;
}) {
  const rows = await sql<LanguageRow>`
    select * from languages
    where concat_ws(' ', code, name) ilike coalesce('%' || ${query.query ?? null}  || '%', '%')
    limit ${query.limit}
    offset ${query.offset};
    `;

  return rows.map(mapLanguage);
}
