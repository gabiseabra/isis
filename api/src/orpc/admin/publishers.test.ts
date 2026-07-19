import { setupDatabase } from "../../test/setup-database";
import { setupOrpcClient } from "../../test/setup-orpc-client";
import { adminRouter } from "../admin";

setupDatabase();

const clientRef = setupOrpcClient(
  adminRouter,
  { request: { headers: {} } },
  {
    name: "Test",
    email: "test@isis.com",
    password: "test",
  },
);

describe("adminRouter.publishers", () => {
  describe("upsert", () => {
    it("creates a new publisher", async () => {
      await expect(
        clientRef.current?.publishers.upsert({
          name: "Test",
          countryCode: "AU",
        }),
      ).resolves.toEqual({
        id: `id://Publisher/1`,
        name: "Test",
        countryCode: "AU",
        imageUrl: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("updates an existing publisher", async () => {
      await expect(
        clientRef.current?.publishers.upsert({
          id: `id://Publisher/1`,
          name: "Teste",
          countryCode: "BR",
        }),
      ).resolves.toEqual({
        id: `id://Publisher/1`,
        name: "Teste",
        countryCode: "BR",
        imageUrl: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("returns 404 when updating a missing publisher", async () => {
      await expect(
        clientRef.current?.publishers.upsert({
          id: `id://Publisher/420`,
          name: "Teste",
          countryCode: "BR",
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("get", () => {
    it("returns an existing publisher", async () => {
      await expect(
        clientRef.current?.publishers.get({
          id: `id://Publisher/1`,
        }),
      ).resolves.toEqual({
        id: `id://Publisher/1`,
        name: "Teste",
        countryCode: "BR",
        imageUrl: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("returns 404 when publisher does not exist", async () => {
      await expect(
        clientRef.current?.publishers.get({ id: `id://Publisher/420` }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("query", () => {
    beforeAll(async () => {
      await clientRef.current?.publishers.upsert({
        name: "Query Alpha",
        countryCode: "BR",
      });
      await clientRef.current?.publishers.upsert({
        name: "Query Omega",
        countryCode: "CA",
      });
      await clientRef.current?.publishers.upsert({
        name: "Same Publisher",
        countryCode: "BR",
      });
      await clientRef.current?.publishers.upsert({
        name: "Same Publisher",
        countryCode: "CA",
      });
    });

    it("supports page and limit", async () => {
      await expect(
        clientRef.current?.publishers.query({
          page: 2,
          limit: 2,
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
        hasNextPage: true,
      });
    });

    it("supports sort and order", async () => {
      await expect(
        clientRef.current?.publishers.query({
          page: 1,
          limit: 3,
          sort: "name",
          order: "desc",
        }),
      ).resolves.toMatchObject({
        items: [
          {
            id: `id://Publisher/1`,
            name: "Teste",
          },
          {
            id: `id://Publisher/4`,
            name: "Same Publisher",
          },
          {
            id: `id://Publisher/5`,
            name: "Same Publisher",
          },
        ],
        hasNextPage: true,
      });
    });

    it("supports query", async () => {
      await expect(
        clientRef.current?.publishers.query({
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
        clientRef.current?.publishers.query({
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
        clientRef.current?.publishers.query({
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
