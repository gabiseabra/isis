import { createPublisher } from "../../services/publishers/db";
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
  it("works", async () => {
    const { createdAt, updatedAt } = await createPublisher({
      name: "Test",
      countryCode: "BR",
    });

    await expect(
      clientRef.current?.publishers.get({ id: `id://Publisher/1` }),
    ).resolves.toEqual({
      id: `id://Publisher/1`,
      name: "Test",
      countryCode: "BR",
      imageUrl: undefined,
      createdAt,
      updatedAt,
    });
  });
});
