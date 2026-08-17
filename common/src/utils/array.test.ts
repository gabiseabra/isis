import { Author } from "../dto/author";
import { BookInput } from "../dto/book/input";
import { partition } from "./array";
import { hasNonNullableProperty } from "./guards";

describe("partition", () => {
  it("keeps the concrete author branches usable", () => {
    const authors: BookInput["authors"] = [
      { id: "id://Author/1" },
      {
        name: "New author",
      },
    ];

    const [authorIds, authorsToCreate] = partition(
      authors,
      hasNonNullableProperty("id"),
    );
    const authorId: Author["id"] = authorIds[0]!.id;
    const authorName: string = authorsToCreate[0]!.name;

    expect(authorId).toBe("id://Author/1");
    expect(authorName).toBe("New author");
  });

  it("returns predicate matches first and non-matches second", () => {
    const values: (string | number | boolean)[] = ["a", 1, true];
    const [strings, rest] = partition(
      values,
      (value): value is string => typeof value === "string",
    );
    const stringValue: string = strings[0]!;
    const restValue: number | boolean = rest[0]!;

    expect(stringValue).toBe("a");
    expect(restValue).toBe(1);
  });
});
