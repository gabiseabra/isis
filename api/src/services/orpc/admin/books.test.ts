import { UUID } from "@isis/common/dto/uuid";
import {
  createORPCContext,
  OrpcClient,
  setupOrpcClient,
} from "../../../test-utils/setup-orpc-client";
import {
  clearDatabaseTest,
  setupDatabaseTest,
  tearDownDatabaseTest,
} from "../../../test-utils/setup-pg-client";
import { upsertDraftBook } from "../../books/repo";
import { createBook } from "../../books/repo/books";
import { shutDown } from "../../runtime/shut-down";
import { adminRouter } from "../admin";

const dbID = UUID.create();
let client: OrpcClient<typeof adminRouter>;

beforeAll(async () => {
  await setupDatabaseTest(dbID);
  client = await setupOrpcClient(adminRouter, createORPCContext(), {
    name: "Test",
    email: "test@isis.com",
    password: "test",
  });
});

afterAll(async () => {
  await tearDownDatabaseTest(dbID);
  await shutDown();
});

beforeEach(async () => {
  await clearDatabaseTest(dbID);
});

const sampleData = [
  {
    title: "Tractatus",
    status: "unpublished" as const,
    slug: "tractatus",
    isbn: "1234567890",
    imageUrl: "tractatus.jpg",
    publishYear: 1921,
    languages: ["en"],
    tags: ["philosophy", "jokes"],
  },
  {
    title: "Begrebet Angest",
    status: "unpublished" as const,
    slug: "angest",
    isbn: "2345678901",
    imageUrl: "angest.jpg",
    publishYear: 1844,
    languages: ["da"],
    tags: ["philosophy", "jokes"],
  },
  {
    title: "Der Einzige und sein Eigentum",
    status: "unpublished" as const,
    slug: "unique",
    isbn: "3456789012",
    imageUrl: "unique.jpg",
    publishYear: 1844,
    languages: ["de"],
    tags: ["philosophy", "jokes"],
  },
  {
    title: "Studies on Hysteria",
    status: "unpublished" as const,
    slug: "hysteria",
    isbn: "4567890123",
    imageUrl: "hysteria.jpg",
    publishYear: 1895,
    languages: ["en"],
    tags: ["psychology", "jokes"],
  },
];

describe("adminRouter.books", () => {
  describe("get", () => {
    it("returns an existing book", async () => {
      await createBook(sampleData[0]);

      await expect(client.books.get({ id: `id://Book/1` })).resolves.toEqual({
        id: `id://Book/1`,
        status: "unpublished",
        title: "Tractatus",
        slug: "tractatus",
        isbn: "1234567890",
        imageUrl: "tractatus.jpg",
        publishYear: 1921,
        publisherId: undefined,
        authorIds: [],
        languages: [],
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
      await createBook(sampleData[0]);
      await createBook(sampleData[1]);
      await createBook(sampleData[2]);
      await createBook(sampleData[3]);
    });

    it("supports page and limit", async () => {
      await expect(
        client.books.query({
          page: 2,
          limit: 2,
          offset: 0,
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
          offset: 0,
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
          offset: 0,
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
          offset: 0,
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
          offset: 0,
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

  describe("drafts", () => {
    describe("get", () => {
      it.only("returns an active draft", async () => {
        await createBook(sampleData[0]);
        await upsertDraftBook({
          bookId: `id://Book/1`,
          uuid: null,
          appliedAt: null,
          publisher: null,
          authors: [],
          ...sampleData[0],
        });

        await expect(
          client.books.drafts.get({ id: `id://Book/1` }),
        ).resolves.toMatchObject({
          success: true,
          data: {
            uuid: expect.any(String),
            bookId: "id://Book/1",
            title: "Tractatus",
            slug: "tractatus",
            isbn: "1234567890",
            imageUrl: "tractatus.jpg",
            publishYear: 1921,
            publisher: undefined,
            authors: [],
            languages: ["en"],
            tags: ["philosophy", "jokes"],
            appliedAt: undefined,
            deletedAt: undefined,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        });
      });

      it("returns 404 when book does not exist", async () => {
        await expect(
          client.books.drafts.get({ id: `id://Book/420` }),
        ).rejects.toMatchObject({ code: "NOT_FOUND" });
      });
    });

    describe("upsert", () => {
      it("creates a draft without a backing book id", async () => {
        await expect(
          client.books.drafts.upsert({
            authors: [],
            ...sampleData[0],
          }),
        ).resolves.toMatchObject({
          success: true,
          data: {
            uuid: expect.any(String),
            bookId: undefined,
            title: "Tractatus",
            slug: "tractatus",
            isbn: "1234567890",
            imageUrl: "tractatus.jpg",
            publishYear: 1921,
            publisher: undefined,
            authors: [],
            languages: ["en"],
            tags: ["philosophy", "jokes"],
            appliedAt: undefined,
            deletedAt: undefined,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        });
      });

      it("returns 404 when creating a draft for a missing book", async () => {
        await expect(
          client.books.drafts.upsert({
            id: `id://Book/420`,
            authors: [],
            ...sampleData[0],
          }),
        ).rejects.toMatchObject({ code: "NOT_FOUND" });
      });
    });

    describe("apply", () => {
      it("applies saved draft changes to an existing book", async () => {
        await createBook(sampleData[0]);

        const draft = await client.books.drafts.upsert({
          id: `id://Book/1`,
          ...sampleData[0],
          title: "Tractatus Revised",
          slug: "tractatus-revised",
          imageUrl: "tractatus-revised.jpg",
          publishYear: 1922,
          tags: ["revised"],
          authors: [
            {
              name: "Ludwig Wittgenstein",
            },
          ],
        });

        await expect(
          client.books.get({ id: `id://Book/1` }),
        ).resolves.toMatchObject({
          ...sampleData[0],
          languages: [],
        });

        await expect(
          client.books.drafts.apply({ uuid: draft.data.uuid }),
        ).resolves.toEqual({
          id: `id://Book/1`,
          status: "unpublished",
          title: "Tractatus Revised",
          slug: "tractatus-revised",
          isbn: "1234567890",
          imageUrl: "tractatus-revised.jpg",
          publishYear: 1922,
          publisherId: undefined,
          authorIds: [`id://Author/1`],
          languages: ["en"],
          tags: ["revised"],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });

      it("creates a new book without backing book id", async () => {
        const draft = await client.books.drafts.upsert({
          ...sampleData[0],
          authors: [],
        });

        await expect(
          client.books.drafts.apply({ uuid: draft.data.uuid }),
        ).resolves.toEqual({
          id: `id://Book/1`,
          status: "unpublished",
          title: "Tractatus",
          slug: "tractatus",
          isbn: "1234567890",
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
          client.books.drafts.apply({ uuid: UUID.create() }),
        ).rejects.toMatchObject({ code: "NOT_FOUND" });
      });
    });

    describe("discard", () => {
      it("discards an active draft", async () => {
        const book = await createBook(sampleData[0]);
        await client.books.drafts.upsert({
          id: `id://Book/1`,
          ...sampleData[0],
          title: "Tractatus discarded",
          publishYear: 1923,
          tags: ["discarded"],
          authors: [],
        });

        await expect(
          client.books.drafts.delete({ id: `id://Book/1` }),
        ).resolves.toBeUndefined();

        await expect(
          client.books.drafts.get({ id: `id://Book/1` }),
        ).resolves.toBeNull();

        await expect(
          client.books.get({ id: `id://Book/1` }),
        ).resolves.toMatchObject(book);
      });

      it("returns 404 when book does not exist", async () => {
        await expect(
          client.books.drafts.delete({ id: `id://Book/420` }),
        ).rejects.toMatchObject({ code: "NOT_FOUND" });
      });
    });
  });
});
