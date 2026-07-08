import { createErrorHandler } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { getUser } from "../users/db";
import { getSession } from "./db";
import { JWT } from "./jwt";

export async function verifySession(token: string) {
  const payload = await JWT.parseToken(token).catch(
    createErrorHandler().catch(JWT.UnauthorizedError, () => {
      throw new verifySession.UnauthorizedError();
    }),
  );

  const session = await getSession(payload.uuid);

  if (!session || (session.revoked_at && session.revoked_at <= new Date()))
    throw new verifySession.UnauthorizedError();

  const user = await getUser(ID.create("User", session.user_id));

  return { user, session };
}

verifySession.UnauthorizedError = class UnauthorizedError extends Error {};
