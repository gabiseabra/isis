import { ORPCError } from "@orpc/contract";

export class MediaNotFound extends ORPCError<"NOT_FOUND", void> {
  constructor(message?: string) {
    super("NOT_FOUND", { message });
  }
}

export class MediaInputUnprocessable extends ORPCError<
  "UNPROCESSABLE_ENTITY",
  void
> {
  constructor(message?: string) {
    super("UNPROCESSABLE_ENTITY", { message });
  }
}
