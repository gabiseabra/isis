import { UUID } from "@isis/common/dto/uuid";
import { ID } from "@isis/common/utils/id";
import { sqlOne, sqlOneMaybe } from "../db/sql";
import { JWT } from "./jwt";

class SessionRow {
  constructor(
    public uuid: UUID,
    public user_id: number,
    public created_at: Date,
    public revoked_at: Date | null,
  ) {}
}

export async function createSessionRow(input: JWT) {
  return await sqlOne<SessionRow>`
    insert into sessions (user_id, uuid)
    values (${ID.parse(input.userId).id}, ${input.uuid})
    returning *;
    `;
}

export async function getSession(uuid: UUID) {
  return sqlOneMaybe<SessionRow>`
    select * from sessions
    where uuid = ${uuid}
    `;
}
