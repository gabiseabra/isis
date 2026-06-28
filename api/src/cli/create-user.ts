import { CreateUserInput } from "@isis/common/dto/user/create-input";
import { pipe } from "ts-functional-pipe";
import z from "zod";
import { createUser } from "../services/users/create";
import { UserRow } from "../services/users/row";
import { ANSI } from "../utils/ansi";
import { Command } from "../utils/command";
import { Theme } from "../utils/theme";

export default Command.create(
  async (options, email, password) => {
    const user = await createUser(
      CreateUserInput.parse({
        name: options.name ?? email,
        email,
        password,
      }),
    );

    console.log(
      pipe(ANSI.bold, ANSI.hex(Theme.green))("User created: "),
      UserRow.toJson(user).id,
    );
  },
  {
    description: "Create a user with an email, password, and optional name.",
    example: "create-user admin@example.com password123",
    options: z
      .object({
        name: z
          .string()
          .optional()
          .describe(`Define the user's name, defaults to the same as email.`),
      })
      .strict(),
  },
);
