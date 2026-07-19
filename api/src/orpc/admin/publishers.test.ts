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

describe("adminRouter.publishers", () => {
  describe("upsert", () => {
    it("creates a new publisher", async () => {
      await expect(
        client.publishers.upsert({
          name: "Routledge",
        }),
      ).resolves.toEqual({
        id: `id://Publisher/1`,
        name: "Routledge",
        countryCode: undefined,
        imageUrl: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("updates an existing publisher", async () => {
      await expect(
        client.publishers.upsert({
          id: `id://Publisher/1`,
          name: "Routledge",
          countryCode: "GB",
        }),
      ).resolves.toEqual({
        id: `id://Publisher/1`,
        name: "Routledge",
        countryCode: "GB",
        imageUrl: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("returns 404 when updating a missing publisher", async () => {
      await expect(
        client.publishers.upsert({
          id: `id://Publisher/420`,
          name: "Routledge",
          countryCode: "GB",
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("get", () => {
    it("returns an existing publisher", async () => {
      await expect(
        client.publishers.get({
          id: `id://Publisher/1`,
        }),
      ).resolves.toEqual({
        id: `id://Publisher/1`,
        name: "Routledge",
        countryCode: "GB",
        imageUrl: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("returns 404 when publisher does not exist", async () => {
      await expect(
        client.publishers.get({ id: `id://Publisher/420` }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("query", () => {
    beforeAll(async () => {
      await client.publishers.upsert({
        name: "Query Alpha",
        countryCode: "BR",
      });
      await client.publishers.upsert({
        name: "Query Omega",
        countryCode: "CA",
      });
      await client.publishers.upsert({
        name: "Same Publisher",
        countryCode: "BR",
      });
      await client.publishers.upsert({
        name: "Same Publisher",
        countryCode: "CA",
      });
    });

    it("supports page and limit", async () => {
      await expect(
        client.publishers.query({
          page: 2,
          limit: 2,
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Publisher/1`,
            name: "Routledge",
          },
          {
            id: `id://Publisher/4`,
            name: "Same Publisher",
          },
        ],
        hasNextPage: true,
      });
    });

    it("supports sort and order", async () => {
      await expect(
        client.publishers.query({
          page: 1,
          limit: 3,
          sort: "name",
          order: "desc",
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Publisher/4`,
            name: "Same Publisher",
          },
          {
            id: `id://Publisher/5`,
            name: "Same Publisher",
          },
          {
            id: `id://Publisher/1`,
            name: "Routledge",
          },
        ],
        hasNextPage: true,
      });
    });

    it("supports query", async () => {
      await expect(
        client.publishers.query({
          page: 1,
          limit: 10,
          query: "Query",
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Publisher/2`,
            name: "Query Alpha",
          },
          {
            id: `id://Publisher/3`,
            name: "Query Omega",
          },
        ],
        hasNextPage: false,
      });
    });

    it("supports name", async () => {
      await expect(
        client.publishers.query({
          page: 1,
          limit: 10,
          name: "Same Publisher",
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Publisher/4`,
            name: "Same Publisher",
          },
          {
            id: `id://Publisher/5`,
            name: "Same Publisher",
          },
        ],
        hasNextPage: false,
      });
    });

    it("supports ids", async () => {
      await expect(
        client.publishers.query({
          page: 1,
          limit: 10,
          ids: [`id://Publisher/2`, `id://Publisher/3`],
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Publisher/2`,
            name: "Query Alpha",
          },
          {
            id: `id://Publisher/3`,
            name: "Query Omega",
          },
        ],
        hasNextPage: false,
      });
    });
  });
});
