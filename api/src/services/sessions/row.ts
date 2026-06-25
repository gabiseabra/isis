import { UUID } from "@isis/common/dto/uuid";
import { ID } from "@isis/common/utils/id";
import { sqlOne } from "../../db/sql";
import { JWT } from "./jwt";

export class SessionRow {
  constructor(
    public uuid: UUID,
    public user_id: number,
    public created_at: Date,
    public revoked_at: Date | null,
  ) {}

  static async create(input: JWT) {
    return await sqlOne<SessionRow>`
    insert into sessions (user_id, uuid)
    values (${ID.parse(input.userId).id}, ${input.uuid})
    returning *;
    `;
  }

  static async get(uuid: UUID) {
    return sqlOne<SessionRow>`
    select * from sessions
    where uuid = ${uuid}
    `;
  }
}
