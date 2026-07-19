import { UUID } from "@isis/common/dto/uuid";
import { createBook } from "../../services/books/db";
import { upsertBook } from "../../services/books/upsert";
import {
  setupDatabase,
  tearDownDatabase,
  truncateDatabase,
} from "../../test/setup-database";
import { OrpcClient, setupOrpcClient } from "../../test/setup-orpc-client";
import { adminRouter } from "../admin";

const dbID = UUID.create();
let client: OrpcClient<typeof adminRouter>;

beforeAll(async () => {
  await setupDatabase(dbID);
  client = await setupOrpcClient(
    adminRouter,
    { request: { headers: {} } },
    {
      name: "Test",
      email: "test@isis.com",
      password: "test",
    },
  );
});

afterAll(async () => {
  await tearDownDatabase(dbID);
});

beforeEach(async () => {
  await truncateDatabase(dbID);
});

const sampleData = [
  {
    title: "Tractatus",
    status: "unpublished" as const,
    slug: "tractatus",
    isbn13: "1234567890123",
    isbn10: "1234567890",
    imageUrl: "tractatus.jpg",
    publishYear: 1921,
    authorIds: [],
    languages: ["en"],
    tags: ["philosophy", "jokes"],
  },
  {
    title: "Begrebet Angest",
    status: "unpublished" as const,
    slug: "angest",
    isbn13: "fill",
    isbn10: "fill",
    imageUrl: "angest.jpg",
    publishYear: 1844,
    authorIds: [],
    languages: ["da"],
    tags: ["philosophy", "jokes"],
  },
  {
    title: "Der Einzige und sein Eigentum",
    status: "unpublished" as const,
    slug: "unique",
    isbn13: "fill",
    isbn10: "fill",
    imageUrl: "unique.jpg",
    publishYear: 1844,
    authorIds: [],
    languages: ["de"],
    tags: ["philosophy", "jokes"],
  },
  {
    title: "Studies on Hysteria",
    status: "unpublished" as const,
    slug: "hysteria",
    isbn13: "fill",
    isbn10: "fill",
    imageUrl: "hysteria.jpg",
    publishYear: 1895,
    authorIds: [],
    languages: ["en"],
    tags: ["psychology", "jokes"],
  },
];

describe("adminRouter.books", () => {
  describe("get", () => {
    it("returns an existing book", async () => {
      await upsertBook(sampleData[0]);

      await expect(client.books.get({ id: `id://Book/1` })).resolves.toEqual({
        id: `id://Book/1`,
        status: "unpublished",
        title: "Tractatus",
        slug: "tractatus",
        isbn13: "1234567890123",
        isbn10: "1234567890",
        imageUrl: "tractatus.jpg",
        publishYear: 1921,
        publisherId: undefined,
        authorIds: [],
        languages: ["en"],
        tags: ["philosophy", "jokes"],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("returns 404 when book does not exist", async () => {
      await expect(
        client.books.get({ id: `id://Book/420` }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("query", () => {
    beforeEach(async () => {
      await upsertBook(sampleData[0]);
      await upsertBook(sampleData[1]);
      await upsertBook(sampleData[2]);
      await upsertBook(sampleData[3]);
    });

    it("supports page and limit", async () => {
      await expect(
        client.books.query({
          page: 2,
          limit: 2,
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Book/4`,
            title: "Studies on Hysteria",
          },
          {
            id: `id://Book/1`,
            title: "Tractatus",
          },
        ],
        hasNextPage: false,
      });
    });

    it("supports sort and order", async () => {
      await expect(
        client.books.query({
          page: 1,
          limit: 3,
          sort: "name",
          order: "desc",
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Book/1`,
            title: "Tractatus",
          },
          {
            id: `id://Book/4`,
            title: "Studies on Hysteria",
          },
          {
            id: `id://Book/3`,
            title: "Der Einzige und sein Eigentum",
          },
        ],
        hasNextPage: true,
      });
    });

    it("supports query", async () => {
      await expect(
        client.books.query({
          page: 1,
          limit: 10,
          query: "Einzige",
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Book/3`,
            title: "Der Einzige und sein Eigentum",
          },
        ],
        hasNextPage: false,
      });
    });

    it("supports ids", async () => {
      await expect(
        client.books.query({
          page: 1,
          limit: 10,
          ids: [`id://Book/2`, `id://Book/3`],
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Book/2`,
            title: "Begrebet Angest",
          },
          {
            id: `id://Book/3`,
            title: "Der Einzige und sein Eigentum",
          },
        ],
        hasNextPage: false,
      });
    });

    it("supports tags", async () => {
      await expect(
        client.books.query({
          page: 1,
          limit: 10,
          tags: ["psychology"],
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Book/4`,
            title: "Studies on Hysteria",
          },
        ],
        hasNextPage: false,
      });
    });
  });

  describe("getDraft", () => {
    it("returns an active draft", async () => {
      await client.books.upsertDraft(sampleData[0]);

      await expect(
        client.books.getDraft({ id: `id://Book/1` }),
      ).resolves.toMatchObject({
        bookId: `id://Book/1`,
        deletedAt: null,
        appliedAt: null,
        row: {
          cells: expect.arrayContaining([
            { columnId: 1, value: "Tractatus" },
            { columnId: 2, value: "tractatus" },
            { columnId: 10, value: ["philosophy", "jokes"] },
          ]),
        },
        errors: [],
      });
    });

    it("returns 404 when book does not exist", async () => {
      await expect(
        client.books.getDraft({ id: `id://Book/420` }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("upsertDraft", () => {
    it("creates a draft and backing book", async () => {
      await expect(
        client.books.upsertDraft(sampleData[0]),
      ).resolves.toMatchObject({
        bookId: `id://Book/1`,
        sheetId: `id://Sheet/1`,
        rowId: 1,
        deletedAt: null,
        appliedAt: null,
        row: {
          sheetId: `id://Sheet/1`,
          rowId: 1,
          cells: expect.arrayContaining([
            { columnId: 1, value: "Tractatus" },
            { columnId: 2, value: "tractatus" },
            { columnId: 9, value: ["en"] },
            { columnId: 10, value: ["philosophy", "jokes"] },
          ]),
        },
        errors: [],
      });
    });

    it("returns 404 when creating a draft for a missing book", async () => {
      await expect(
        client.books.upsertDraft({
          id: `id://Book/420`,
          title: "Missing",
          authorIds: [],
          languages: [],
          tags: [],
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("applyDraft", () => {
    it("is noop with unsaved draft", async () => {
      const book = await createBook(sampleData[0]);
      await expect(client.books.getDraft({ id: book.id })).resolves.toBeNull();
      await expect(
        client.books.applyDraft({ id: book.id }),
      ).resolves.toMatchObject(book);
    });

    it("applies saved draft changes to an existing book", async () => {
      await upsertBook(sampleData[0]);

      await client.books.upsertDraft({
        id: `id://Book/1`,
        ...sampleData[0],
        title: "Tractatus Revised",
        slug: "tractatus-revised",
        imageUrl: "tractatus-revised.jpg",
        publishYear: 1922,
        tags: ["revised"],
      });

      await expect(
        client.books.get({ id: `id://Book/1` }),
      ).resolves.toMatchObject(sampleData[0]);

      await expect(
        client.books.applyDraft({ id: `id://Book/1` }),
      ).resolves.toEqual({
        id: `id://Book/1`,
        status: "unpublished",
        title: "Tractatus Revised",
        slug: "tractatus-revised",
        isbn13: "1234567890123",
        isbn10: "1234567890",
        imageUrl: "tractatus-revised.jpg",
        publishYear: 1922,
        publisherId: undefined,
        authorIds: [],
        languages: ["en"],
        tags: ["revised"],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      await expect(
        client.books.getDraft({ id: `id://Book/1` }),
      ).resolves.toBeNull();
    });

    it("returns 404 when book does not exist", async () => {
      await expect(
        client.books.applyDraft({ id: `id://Book/420` }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("discardDraft", () => {
    it("discards an active draft", async () => {
      const book = await createBook(sampleData[0]);
      await client.books.upsertDraft({
        id: `id://Book/1`,
        ...sampleData[0],
        title: "Tractatus discarded",
        publishYear: 1923,
        tags: ["discarded"],
      });

      await expect(
        client.books.discardDraft({ id: `id://Book/1` }),
      ).resolves.toBeUndefined();

      await expect(
        client.books.getDraft({ id: `id://Book/1` }),
      ).resolves.toBeNull();

      await expect(
        client.books.get({ id: `id://Book/1` }),
      ).resolves.toMatchObject(book);
    });

    it("returns 404 when book does not exist", async () => {
      await expect(
        client.books.discardDraft({ id: `id://Book/420` }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });
});
