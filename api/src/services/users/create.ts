import { CreateUserInput } from "@isis/common/dto/user/create-input";
import argon2 from "argon2";
import * as db from "./db";

export async function createUser(input: CreateUserInput) {
  return await db.createUser({
    name: input.name,
    email: input.email,
    passwordHash: (await argon2.hash(input.password)).toString(),
  });
}
