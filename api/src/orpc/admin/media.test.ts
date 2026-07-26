import { MediaInput } from "@isis/common/dto/media/input";
import { UUID } from "@isis/common/dto/uuid";
import { upsertMedia } from "../../services/media/upsert";
import {
  setupDatabase,
  tearDownDatabase,
  truncateDatabase,
} from "../../test/setup-database";
import {
  createORPCContext,
  OrpcClient,
  setupOrpcClient,
} from "../../test/setup-orpc-client";
import { adminRouter } from "../admin";

const dbID = UUID.create();
let client: OrpcClient<typeof adminRouter>;

beforeAll(async () => {
  await setupDatabase(dbID);
  client = await setupOrpcClient(adminRouter, createORPCContext(), {
    name: "Test",
    email: "test@isis.com",
    password: "test",
  });
});

afterAll(async () => {
  await tearDownDatabase(dbID);
});

beforeEach(async () => {
  await truncateDatabase(dbID);
  const museumScans = await upsertMedia(sampleData[0]);
  const botanicalPlates = await upsertMedia({
    ...sampleData[1],
    parentId: museumScans.id,
  });
  await upsertMedia({ ...sampleData[2], parentId: botanicalPlates.id });
  await upsertMedia({ ...sampleData[3], parentId: botanicalPlates.id });
  await upsertMedia({ ...sampleData[4], parentId: museumScans.id });
  await upsertMedia(sampleData[5]);
});

const sampleData: MediaInput[] = [
  {
    name: "Museum Scans",
    slug: "museum_scans",
    tags: ["folder", "archive"],
    metadata: {
      kind: "folder",
      description: "Digitized museum archive",
    },
  },
  {
    name: "Botanical Plates",
    slug: "botanical_plates",
    tags: ["folder", "png"],
    metadata: {
      kind: "folder",
      description: "PNG scans from botanical plate books",
    },
  },
  {
    name: "Plate 0001.png",
    slug: "plate_0001_png",
    tags: ["file", "png", "botany"],
    metadata: {
      kind: "file",
      mimeType: "image/png",
      sizeBytes: 2411722,
      storageKey: "media/museum_scans/botanical_plates/plate_0001.png",
    },
  },
  {
    name: "Plate 0002.png",
    slug: "plate_0002_png",
    tags: ["file", "png", "botany"],
    metadata: {
      kind: "file",
      mimeType: "image/png",
      sizeBytes: 2380901,
      storageKey: "media/museum_scans/botanical_plates/plate_0002.png",
    },
  },
  {
    name: "Field Guide.pdf",
    slug: "field_guide_pdf",
    tags: ["file", "pdf", "guide"],
    metadata: {
      kind: "file",
      mimeType: "application/pdf",
      sizeBytes: 7340032,
      storageKey: "media/museum_scans/field_guide.pdf",
    },
  },
  {
    name: "Vendor Invoices",
    slug: "vendor_invoices",
    tags: ["folder", "pdf", "invoices"],
    metadata: {
      kind: "folder",
      description: "PDF invoices from print vendors",
    },
  },
];

describe("adminRouter.media", () => {
  describe("get", () => {
    it("returns an existing media entry", async () => {
      await expect(client.media.get({ id: `id://Media/3` })).resolves.toEqual({
        id: `id://Media/3`,
        parentIds: [`id://Media/1`, `id://Media/2`],
        path: "museum_scans.botanical_plates.plate_0001_png",
        name: "Plate 0001.png",
        slug: "plate_0001_png",
        tags: ["file", "png", "botany"],
        metadata: {
          kind: "file",
          mimeType: "image/png",
          sizeBytes: 2411722,
          storageKey: "media/museum_scans/botanical_plates/plate_0001.png",
        },
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: undefined,
      });
    });

    it("returns 404 when media does not exist", async () => {
      await expect(
        client.media.get({ id: `id://Media/420` }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("query", () => {
    it("supports page and limit", async () => {
      await expect(
        client.media.query({ page: 2, limit: 2, rootId: `id://Media/1` }),
      ).resolves.toMatchObject({
        items: [
          { id: `id://Media/3`, name: "Plate 0001.png" },
          { id: `id://Media/4`, name: "Plate 0002.png" },
        ],
        hasNextPage: false,
      });
    });

    it("supports sort and order", async () => {
      await expect(
        client.media.query({
          page: 1,
          limit: 3,
          rootId: `id://Media/1`,
          sort: "name",
          order: "desc",
        }),
      ).resolves.toMatchObject({
        items: [
          { id: `id://Media/4`, name: "Plate 0002.png" },
          { id: `id://Media/3`, name: "Plate 0001.png" },
          { id: `id://Media/5`, name: "Field Guide.pdf" },
        ],
        hasNextPage: true,
      });
    });

    it("supports query", async () => {
      await expect(
        client.media.query({ page: 1, limit: 10, query: "Plate" }),
      ).resolves.toMatchObject({
        items: [
          { id: `id://Media/2`, name: "Botanical Plates" },
          { id: `id://Media/3`, name: "Plate 0001.png" },
          { id: `id://Media/4`, name: "Plate 0002.png" },
        ],
        hasNextPage: false,
      });
    });

    it("supports ids", async () => {
      await expect(
        client.media.query({
          page: 1,
          limit: 10,
          ids: [`id://Media/3`, `id://Media/5`],
        }),
      ).resolves.toMatchObject({
        items: [
          { id: `id://Media/5`, name: "Field Guide.pdf" },
          { id: `id://Media/3`, name: "Plate 0001.png" },
        ],
        hasNextPage: false,
      });
    });

    it("supports tags", async () => {
      await expect(
        client.media.query({
          page: 1,
          limit: 10,
          rootId: `id://Media/1`,
          tags: ["png"],
        }),
      ).resolves.toMatchObject({
        items: [
          { id: `id://Media/2`, name: "Botanical Plates" },
          { id: `id://Media/3`, name: "Plate 0001.png" },
          { id: `id://Media/4`, name: "Plate 0002.png" },
        ],
        hasNextPage: false,
      });
    });
  });

  describe("queryChildren", () => {
    it("returns root entries", async () => {
      await expect(
        client.media.queryChildren({ page: 1, limit: 10 }),
      ).resolves.toMatchObject({
        items: [
          { id: `id://Media/1`, name: "Museum Scans", parentIds: [] },
          { id: `id://Media/6`, name: "Vendor Invoices", parentIds: [] },
        ],
        hasNextPage: false,
      });
    });

    it("returns immediate children", async () => {
      await expect(
        client.media.queryChildren({
          page: 1,
          limit: 10,
          rootId: `id://Media/1`,
        }),
      ).resolves.toMatchObject({
        items: [
          { id: `id://Media/2`, name: "Botanical Plates" },
          { id: `id://Media/5`, name: "Field Guide.pdf" },
        ],
        hasNextPage: false,
      });
    });
  });

  describe("upsert", () => {
    it("updates an existing media entry", async () => {
      await expect(
        client.media.upsert({
          id: `id://Media/3`,
          parentId: `id://Media/2`,
          name: "Plate 0001 master.png",
          slug: "plate_0001_master_png",
          tags: ["file", "png", "master"],
          metadata: {
            kind: "file",
            mimeType: "image/png",
            sizeBytes: 3000000,
            storageKey:
              "media/museum_scans/botanical_plates/plate_0001_master.png",
          },
        }),
      ).resolves.toMatchObject({
        id: `id://Media/3`,
        parentIds: [`id://Media/1`, `id://Media/2`],
        name: "Plate 0001 master.png",
        slug: "plate_0001_master_png",
        tags: ["file", "png", "master"],
        metadata: {
          kind: "file",
          mimeType: "image/png",
          sizeBytes: 3000000,
          storageKey:
            "media/museum_scans/botanical_plates/plate_0001_master.png",
        },
      });
    });
  });
});
