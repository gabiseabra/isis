import { CreateUserInput } from "@isis/common/dto/user/create-input";
import argon2 from "argon2";
import { UserRow } from "./row";

export async function createUser(input: CreateUserInput) {
  return UserRow.create({
    name: input.name,
    email: input.email,
    passwordHash: (await argon2.hash(input.password)).toString(),
  });
}
