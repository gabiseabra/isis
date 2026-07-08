import argon2 from "argon2";
import { getUser, getUserPasswordHash } from "../users/db";
import { createSessionRow } from "./db";
import { JWT } from "./jwt";

export async function createSession(input: {
  email: string;
  password: string;
}) {
  const userData = await getUserPasswordHash({ email: input.email });

  if (!userData || !userData.passwordHash)
    throw new createSession.UnauthorizedError();

  if (!(await argon2.verify(userData.passwordHash, input.password))) {
    throw new createSession.UnauthorizedError();
  }

  const { token, payload } = JWT.create(userData.id);

  return {
    user: await getUser(userData.id),
    token,
    session: await createSessionRow(payload),
  };
}

createSession.UnauthorizedError = class UnauthorizedError extends Error {};
