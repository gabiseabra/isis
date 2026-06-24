import "dotenv/config";
import z, { ZodError } from "zod";
import { AnyCommand, Command } from "../utils/command";

async function main() {
  const [commandName, ...args] = process.argv.slice(2);
  if (!commandName) throw new Error("Missing command");

  const command: AnyCommand = (await import(`./${commandName}`)).default;

  await Command.run(command, ...args);
}

if (require.main === module)
  main().catch((error) => {
    if (error instanceof ZodError) console.error(z.prettifyError(error));
    if (error instanceof Error) console.error(error.message);
    else console.error(error);
    process.exit(1);
  });
