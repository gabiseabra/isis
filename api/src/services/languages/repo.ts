import { Language } from "@isis/common/dto/language";
import { sql, sqlOneMaybe } from "../db/sql";

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

export async function getLanguage(code: string) {
  const row = await sqlOneMaybe<LanguageRow>`
    select * from languages
    where code = ${code};
    `;

  return row ? mapLanguage(row) : null;
}

export async function queryLanguages(query: {
  offset: number;
  limit: number;
  query?: string;
}) {
  const rows = await sql<LanguageRow>`
    select * from languages
    where concat_ws(' ', code, name) ilike coalesce('%' || ${query.query ?? null}  || '%', '%')
    order by name asc, code asc
    limit ${query.limit}
    offset ${query.offset};
    `;

  return rows.map(mapLanguage);
}
