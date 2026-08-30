import { Book } from "@isis/common/dto/book";
import { UUID } from "@isis/common/dto/uuid";
import {
  createORPCContext,
  OrpcClient,
  setupOrpcClient,
} from "../../../../test-utils/setup-orpc-client";
import {
  clearDatabaseTest,
  setupDatabaseTest,
  tearDownDatabaseTest,
} from "../../../../test-utils/setup-pg-client";
import { createBookPage } from "../../../books/repo";
import { createBook } from "../../../books/repo/books";
import { createMediaEntry } from "../../../media/repo";
import { shutDown } from "../../../runtime/shut-down";
import { adminRouter } from "../../admin";

const dbID = UUID.create();
let client: OrpcClient<typeof adminRouter>;
let book: Book;

beforeAll(async () => {
  await setupDatabaseTest(dbID);
  client = await setupOrpcClient(adminRouter, createORPCContext(), {
    name: "Test",
    email: "test@isis.com",
    password: "test",
  });
});

beforeEach(async () => {
  await clearDatabaseTest(dbID);
  book = await createBook({
    title: "Begrebet Angest",
    status: "unpublished",
    slug: "angest",
    isbn13: "fill",
    isbn10: "fill",
    imageUrl: "angest.jpg",
    publishYear: 1844,
    publisherId: null,
    tags: ["philosophy", "jokes"],
  });

  for (let p = 0; p < 12; p++) {
    const media = await createMediaEntry({
      name: `begretbet-angest-p${p}`,
      slug: `begretbet-angest-p${p}`,
      tags: [],
    });

    await createBookPage({
      bookId: book.id,
      mediaId: media.id,
      pageNumber: p + 1,
      pageType:
        {
          0: "Blank",
          1: "Copyright",
          2: "Title",
        }[p] ?? "Page",
      tags:
        {
          0: ["a"],
          1: ["a", "b"],
          2: ["a", "b", "c"],
        }[p] ?? [],
    });
  }
});

afterAll(async () => {
  await tearDownDatabaseTest(dbID);
  await shutDown();
});

describe("adminRouter.books.pages", () => {
  describe("get", () => {
    it("returns an existing page", async () => {
      await expect(
        client.books.pages.get({ id: `id://BookPage/1` }),
      ).resolves.toMatchObject({
        id: `id://BookPage/1`,
        bookId: book.id,
        pageNumber: 1,
        pageType: "Blank",
        tags: ["a"],
      });
    });

    it("returns 404 when page does not exist", async () => {
      await expect(
        client.books.pages.get({ id: `id://BookPage/420` }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("query", () => {
    it("supports page and limit", async () => {
      await expect(
        client.books.pages.query({
          page: 2,
          limit: 3,
          offset: 0,
          bookId: book.id,
        }),
      ).resolves.toMatchObject({
        items: [
          { id: `id://BookPage/4`, pageNumber: 4 },
          { id: `id://BookPage/5`, pageNumber: 5 },
          { id: `id://BookPage/6`, pageNumber: 6 },
        ],
        hasNextPage: true,
      });
    });

    it("supports sort and order", async () => {
      await expect(
        client.books.pages.query({
          page: 1,
          limit: 3,
          offset: 0,
          bookId: book.id,
          sort: "page_number",
          order: "desc",
        }),
      ).resolves.toMatchObject({
        items: [
          { id: `id://BookPage/12`, pageNumber: 12 },
          { id: `id://BookPage/11`, pageNumber: 11 },
          { id: `id://BookPage/10`, pageNumber: 10 },
        ],
        hasNextPage: true,
      });
    });

    it("supports query", async () => {
      await expect(
        client.books.pages.query({
          page: 1,
          limit: 10,
          offset: 0,
          bookId: book.id,
          query: "Title",
        }),
      ).resolves.toMatchObject({
        items: [{ id: `id://BookPage/3`, pageType: "Title" }],
        hasNextPage: false,
      });
    });

    it("supports ids", async () => {
      await expect(
        client.books.pages.query({
          page: 1,
          limit: 10,
          offset: 0,
          bookId: book.id,
          ids: [`id://BookPage/2`, `id://BookPage/4`],
        }),
      ).resolves.toMatchObject({
        items: [{ id: `id://BookPage/2` }, { id: `id://BookPage/4` }],
        hasNextPage: false,
      });
    });

    it("supports tags", async () => {
      await expect(
        client.books.pages.query({
          page: 1,
          limit: 10,
          offset: 0,
          bookId: book.id,
          tags: ["a", "b"],
        }),
      ).resolves.toMatchObject({
        items: [{ id: `id://BookPage/2` }, { id: `id://BookPage/3` }],
        hasNextPage: false,
      });
    });

    it("supports types", async () => {
      await expect(
        client.books.pages.query({
          page: 1,
          limit: 10,
          offset: 0,
          bookId: book.id,
          types: ["Blank", "Title"],
        }),
      ).resolves.toMatchObject({
        items: [{ id: `id://BookPage/1` }, { id: `id://BookPage/3` }],
        hasNextPage: false,
      });
    });

    it("supports minPageNumber and maxPageNumber", async () => {
      await expect(
        client.books.pages.query({
          page: 1,
          limit: 10,
          offset: 0,
          bookId: book.id,
          minPageNumber: 3,
          maxPageNumber: 5,
        }),
      ).resolves.toMatchObject({
        items: [
          { id: `id://BookPage/3`, pageNumber: 3 },
          { id: `id://BookPage/4`, pageNumber: 4 },
          { id: `id://BookPage/5`, pageNumber: 5 },
        ],
        hasNextPage: false,
      });
    });
  });

  describe("count", () => {
    it("supports filters", async () => {
      await expect(
        client.books.pages.count({ offset: 0, bookId: book.id, tags: ["a"] }),
      ).resolves.toBe(3);
    });
  });

  describe("drafts", () => {
    describe("query", () => {
      it("supports page and limit", async () => {
        const draft = await client.books.drafts.upsert({
          id: book.id,
          status: "unpublished",
          title: "Begrebet Angest",
          authors: [],
          languages: [],
          tags: [],
        });
        await client.books.pages.drafts.upsert({
          bookId: book.id,
          id: `id://BookPage/1`,
          mediaId: `id://Media/1`,
          pageNumber: 13,
          pageType: "Draft",
          tags: ["draft"],
        });
        await client.books.pages.drafts.upsert({
          bookId: book.id,
          id: `id://BookPage/2`,
          mediaId: `id://Media/2`,
          pageNumber: 14,
          pageType: "Draft",
          tags: ["draft"],
        });

        await expect(
          client.books.pages.drafts.query({
            uuid: draft.data.uuid,
            page: 1,
            limit: 1,
            offset: 0,
          }),
        ).resolves.toMatchObject({
          items: [{ pageId: `id://BookPage/1`, pageNumber: 13 }],
          hasNextPage: true,
        });
      });
    });

    describe("upsert", () => {
      it("creates a draft without a backing book page id", async () => {
        await client.books.drafts.upsert({
          id: book.id,
          status: "unpublished",
          title: "Begrebet Angest",
          authors: [],
          languages: [],
          tags: [],
        });

        await expect(
          client.books.pages.drafts.upsert({
            bookId: book.id,
            mediaId: `id://Media/1`,
            pageNumber: 13,
            pageType: "Draft",
            tags: ["draft"],
          }),
        ).resolves.toMatchObject({
          success: true,
          data: {
            uuid: expect.any(String),
            draftBookUuid: expect.any(String),
            pageId: undefined,
            mediaId: `id://Media/1`,
            pageNumber: 13,
            pageType: "Draft",
            tags: ["draft"],
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        });
      });

      it("returns 404 when creating a draft for a missing book", async () => {
        await expect(
          client.books.pages.drafts.upsert({
            bookId: `id://Book/420`,
            mediaId: `id://Media/1`,
            pageNumber: 13,
            pageType: "Draft",
            tags: ["draft"],
          }),
        ).rejects.toMatchObject({ code: "NOT_FOUND" });
      });
    });

    describe("delete", () => {
      it("deletes a draft", async () => {
        const draft = await client.books.drafts.upsert({
          id: book.id,
          status: "unpublished",
          title: "Begrebet Angest",
          authors: [],
          languages: [],
          tags: [],
        });
        const pageDraft = await client.books.pages.drafts.upsert({
          bookId: book.id,
          id: `id://BookPage/1`,
          mediaId: `id://Media/1`,
          pageNumber: 13,
          pageType: "Draft",
          tags: ["draft"],
        });

        await expect(
          client.books.pages.drafts.delete({ uuid: pageDraft.data.uuid }),
        ).resolves.toBeUndefined();
        await expect(
          client.books.pages.drafts.query({
            uuid: draft.data.uuid,
            page: 1,
            limit: 10,
            offset: 0,
          }),
        ).resolves.toMatchObject({ items: [], hasNextPage: false });
      });

      it("returns 404 when draft does not exist", async () => {
        await expect(
          client.books.pages.drafts.delete({ uuid: UUID.create() }),
        ).rejects.toMatchObject({
          code: "NOT_FOUND",
        });
      });
    });
  });
});
