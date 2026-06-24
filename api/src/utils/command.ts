import { runGenerator } from "@isis/common/utils/generator";
import { keys } from "@isis/common/utils/object";
import z, { ZodError } from "zod";
import { ANSI } from "../utils/ansi";
import { Theme } from "../utils/theme";

type AnySchema = { [k: string]: z.ZodType };

export type AnyCommand = Command<AnySchema>;

export type Command<Opt extends AnySchema> = {
  description: string;
  example: string;
  command: (
    ...args: [z.infer<z.ZodObject<Opt>>, ...string[]]
  ) => void | Promise<void>;
  options: z.ZodObject<Opt>;
};

export const Command = {
  create<T extends AnySchema>(
    command: Command<T>["command"],
    options: Omit<Command<T>, "command">,
  ): Command<T> {
    return { command, ...options };
  },

  async run<T extends AnySchema>(command: Command<T>, ...args: string[]) {
    let i = 0;

    const positional = runGenerator(function* () {
      do {
        if (args[i] && !args[i]?.startsWith("--")) yield args[i] ?? "";
        else return;
      } while (++i);
    }).values;

    const optional = command.options.safeParse(
      Object.fromEntries(
        runGenerator(function* () {
          do {
            if (!args[i]) return;
            const name = args[i]?.slice(2) ?? "";
            const schema =
              command.options.shape[name] ??
              Command.fail(command, `Unknown option: ${args[i]}`);

            if (schema instanceof z.ZodBoolean) yield [name, true] as const;
            else yield [name, args[++i]] as const;
          } while (++i);
        }).values,
      ),
    );

    if (command.command.length - 1 !== positional.length)
      return Command.fail(
        command,
        `Expected ${command.command.length - 1} arguments, got ${positional.length}`,
      );

    if (!optional.success)
      return Command.fail(command, printError(optional.error));

    try {
      await command.command(optional.data, ...positional);
    } catch (error) {
      if (error instanceof ZodError)
        Command.fail(command, z.prettifyError(error));
      if (error instanceof Error) Command.fail(command, error.message);
      else throw error;
    }
  },

  print<T extends AnySchema>(command: Command<T>, maxWidth: number) {
    return [
      `${ANSI.bold("usage:")} ${command.example}`,
      "",
      command.description ? [wrap(command.description, maxWidth), ""] : [],
      ANSI.bold("options:"),
      ...keys(command.options.shape).map(
        (option) =>
          `  ${ANSI.bold(
            `--${String(option)}${
              command.options.shape[option]?.toJSONSchema().type === "boolean"
                ? ""
                : ` <${printType(command.options.shape[option])}>`
            }`.padEnd(28),
          )}${[
            command.options.shape[option].description,
            printDefault(command.options.shape[option]),
          ]
            .filter(Boolean)
            .join(" ")
            .match(
              new RegExp(
                `.{1,${Math.max(maxWidth - 30, 20)}}(\\s|$)|\\S+`,
                "g",
              ),
            )
            ?.map((line, index) =>
              index === 0
                ? line.trimEnd()
                : `${" ".repeat(30)}${line.trimEnd()}`,
            )
            .join("\n")}`,
      ),
    ]
      .flat()
      .join("\n");
  },

  fail<T extends AnySchema>(command: Command<T>, message: string): never {
    throw new Error(
      [ANSI.hex(Theme.red)(message), "", Command.print(command, 100)].join(
        "\n",
      ),
    );
  },
};

function printType(schema: z.ZodType) {
  return Array.isArray(schema.toJSONSchema().enum)
    ? schema.toJSONSchema().enum?.join("|")
    : schema.toJSONSchema().type;
}

function printDefault(schema: z.ZodType) {
  return "defaultValue" in schema.def
    ? `Default: ${JSON.stringify(schema.def.defaultValue)}.`
    : "";
}

function printError(error: z.ZodError) {
  return z.prettifyError(error);
}

function wrap(text: string, maxWidth: number) {
  return text
    .match(new RegExp(`.{1,${Math.max(maxWidth, 20)}}(\\s|$)|\\S+`, "g"))
    ?.map((line) => line.trimEnd())
    .join("\n");
}
