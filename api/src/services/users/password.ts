import { ID } from "@isis/common/utils/id";
import argon2 from "argon2";
import { UserRow } from "./row";

export async function updatePassword(input: {
  id: ID<"User">;
  newPassword: string;
  oldPassword: string;
}) {
  const user = await UserRow.get(ID.parse(input.id).id);

  if (
    !user ||
    !(!user.password_hash && !input.oldPassword) ||
    !(await argon2.verify(user.password_hash ?? "", input.oldPassword))
  )
    throw new updatePassword.UnauthorizedError();

  await UserRow.updatePasswordHash({
    id: user.id,
    passwordHash: (await argon2.hash(input.newPassword)).toString(),
  });
}

updatePassword.UnauthorizedError = class UnauthorizedError extends Error {};
