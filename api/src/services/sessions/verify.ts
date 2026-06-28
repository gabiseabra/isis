import { UserRow } from "../users/row";
import { JWT } from "./jwt";
import { SessionRow } from "./row";

export async function verifySession(token: string) {
  const payload = JWT.parseToken(token);

  const session = await SessionRow.get(payload.uuid);

  if (!session || (session.revoked_at && session.revoked_at <= new Date()))
    throw new verifySession.UnauthorizedError();

  const user = await UserRow.get(session.user_id);

  return { user, session };
}

verifySession.UnauthorizedError = class UnauthorizedError extends Error {};
