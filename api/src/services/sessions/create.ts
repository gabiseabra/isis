import argon2 from "argon2";
import { UserRow } from "../users/row";
import { JWT } from "./jwt";
import { SessionRow } from "./row";

export async function createSession(input: {
  email: string;
  password: string;
}) {
  const [user] = await UserRow.query({
    email: input.email,
    limit: 1,
    offset: 0,
  });

  if (!user?.password_hash) throw new createSession.UnauthorizedError();

  if (!(await argon2.verify(user.password_hash, input.password))) {
    throw new createSession.UnauthorizedError();
  }

  const { token, payload } = JWT.create(UserRow.toJson(user).id);

  return {
    user,
    token,
    session: await SessionRow.create(payload),
  };
}

createSession.UnauthorizedError = class UnauthorizedError extends Error {};
