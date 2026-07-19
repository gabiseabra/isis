import { UUID } from "@isis/common/dto/uuid";
import { setupDatabase, tearDownDatabase } from "../../test/setup-database";
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

describe("adminRouter.authors", () => {
  describe("upsert", () => {
    it("creates a new author", async () => {
      await expect(
        client.authors.upsert({
          name: "Wittgenstein",
          countryCode: "AT",
          birthYear: 1889,
        }),
      ).resolves.toEqual({
        id: `id://Author/1`,
        name: "Wittgenstein",
        countryCode: "AT",
        birthYear: 1889,
        deathYear: undefined,
        imageUrl: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("updates an existing author", async () => {
      await expect(
        client.authors.upsert({
          id: `id://Author/1`,
          name: "Wittgenstein",
          countryCode: "AT",
          birthYear: 1889,
          deathYear: 1951,
        }),
      ).resolves.toEqual({
        id: `id://Author/1`,
        name: "Wittgenstein",
        countryCode: "AT",
        birthYear: 1889,
        deathYear: 1951,
        imageUrl: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("returns 404 when updating a missing author", async () => {
      await expect(
        client.authors.upsert({
          id: `id://Author/420`,
          name: "Wittgenstein",
          countryCode: "AT",
          birthYear: 1889,
          deathYear: 1951,
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("get", () => {
    it("returns an existing author", async () => {
      await expect(
        client.authors.get({
          id: `id://Author/1`,
        }),
      ).resolves.toEqual({
        id: `id://Author/1`,
        name: "Wittgenstein",
        countryCode: "AT",
        birthYear: 1889,
        deathYear: 1951,
        imageUrl: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("returns 404 when author does not exist", async () => {
      await expect(
        client.authors.get({ id: `id://Author/420` }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("query", () => {
    beforeAll(async () => {
      await client.authors.upsert({
        name: "Query Alpha",
        countryCode: "BR",
        birthYear: 1901,
      });
      await client.authors.upsert({
        name: "Query Omega",
        countryCode: "CA",
        birthYear: 1902,
      });
      await client.authors.upsert({
        name: "Same Author",
        countryCode: "BR",
        birthYear: 1903,
      });
      await client.authors.upsert({
        name: "Same Author",
        countryCode: "CA",
        birthYear: 1904,
      });
    });

    it("supports page and limit", async () => {
      await expect(
        client.authors.query({
          page: 2,
          limit: 2,
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Author/4`,
            name: "Same Author",
          },
          {
            id: `id://Author/5`,
            name: "Same Author",
          },
        ],
        hasNextPage: true,
      });
    });

    it("supports sort and order", async () => {
      await expect(
        client.authors.query({
          page: 1,
          limit: 3,
          sort: "name",
          order: "desc",
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Author/1`,
            name: "Wittgenstein",
          },
          {
            id: `id://Author/4`,
            name: "Same Author",
          },
          {
            id: `id://Author/5`,
            name: "Same Author",
          },
        ],
        hasNextPage: true,
      });
    });

    it("supports query", async () => {
      await expect(
        client.authors.query({
          page: 1,
          limit: 10,
          query: "Query",
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Author/2`,
            name: "Query Alpha",
          },
          {
            id: `id://Author/3`,
            name: "Query Omega",
          },
        ],
        hasNextPage: false,
      });
    });

    it("supports name", async () => {
      await expect(
        client.authors.query({
          page: 1,
          limit: 10,
          name: "Same Author",
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Author/4`,
            name: "Same Author",
          },
          {
            id: `id://Author/5`,
            name: "Same Author",
          },
        ],
        hasNextPage: false,
      });
    });

    it("supports ids", async () => {
      await expect(
        client.authors.query({
          page: 1,
          limit: 10,
          ids: [`id://Author/2`, `id://Author/3`],
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Author/2`,
            name: "Query Alpha",
          },
          {
            id: `id://Author/3`,
            name: "Query Omega",
          },
        ],
        hasNextPage: false,
      });
    });
  });
});
