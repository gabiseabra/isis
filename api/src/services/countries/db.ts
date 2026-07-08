import { Country } from "@isis/common/dto/country";
import { sql } from "../../db/sql";

class CountryRow {
  constructor(
    public code: string,
    public name: string,
    public created_at: Date,
  ) {}
}

function mapCountry(row: CountryRow): Country {
  return {
    code: row.code,
    name: row.name,
  };
}

export async function queryCountries(query: {
  offset: number;
  limit: number;
  query?: string;
}) {
  const rows = await sql<CountryRow>`
    select * from countries
    where concat_ws(' ', code, name) ilike coalesce('%' || ${query.query ?? null}  || '%', '%')
    limit ${query.limit}
    offset ${query.offset};
    `;

  return rows.map(mapCountry);
}
