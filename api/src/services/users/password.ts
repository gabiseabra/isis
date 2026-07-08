import { User } from "@isis/common/dto/user";
import argon2 from "argon2";
import { getUserPasswordHash, updateUserPasswordHash } from "./db";

export async function updatePassword(
  user: User,
  input: {
    newPassword: string;
    oldPassword: string;
  },
) {
  const userData = await getUserPasswordHash(user);
  if (
    // user not found
    !userData ||
    // match null password hash with empty password input
    !(!userData.passwordHash && !input.oldPassword) ||
    // password doesn't match
    !(await argon2.verify(userData.passwordHash ?? "", input.oldPassword))
  )
    throw new updatePassword.UnauthorizedError();

  await updateUserPasswordHash({
    id: user.id,
    passwordHash: (await argon2.hash(input.newPassword)).toString(),
  });
}

updatePassword.UnauthorizedError = class UnauthorizedError extends Error {};
