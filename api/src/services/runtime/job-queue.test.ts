import { JobQueue } from "./job-queue";
import { shutDown } from "./shut-down";

type BookImport = {
  title: string;
  authors: string[];
  isbn13: string;
};

type ImportedBook = BookImport & {
  slug: string;
  authorLabel: string;
};

class TestQueue extends JobQueue<{
  importBook(book: BookImport): Promise<ImportedBook>;
}> {
  constructor() {
    super("TestQueue", {
      async importBook(book) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {
          ...book,
          slug: book.title
            .toLowerCase()
            .replace(/\W+/g, "_")
            .replace(/^_|_$/g, ""),
          authorLabel: book.authors.join(", "),
        };
      },
    });
  }
}

const tractatus: BookImport = {
  title: "Tractatus Logico-Philosophicus",
  authors: ["Ludwig Wittgenstein"],
  isbn13: "9780415254083",
};

afterAll(async () => {
  await shutDown();
});

describe("JobQueue", () => {
  describe("push", () => {
    it("creates a pending job", async () => {
      await using queue = new TestQueue();
      const job = await queue.push("importBook", tractatus);

      expect(job.type).toBe("importBook");
      await expect(job.getStatus()).resolves.toMatchObject({
        status: "pending",
      });
    });
  });

  describe("getJob", () => {
    it("returns a job by id", async () => {
      await using queue = new TestQueue();
      const { id } = await queue.push("importBook", tractatus);
      const job = await queue.getJob(id);

      expect(job.id).toBe(id);
      expect(job.type).toBe("importBook");
    });
  });

  describe("Job", () => {
    describe("waitUntilFinished", () => {
      it("waits until the job is finished processing and returns the result", async () => {
        await using queue = new TestQueue();
        await queue.startWorker();
        const job = await queue.push("importBook", tractatus);

        const result = await job.waitUntilFinished();

        expect(result).toMatchObject({
          status: "done",
          success: true,
          data: {
            title: tractatus.title,
            slug: "tractatus_logico_philosophicus",
            authorLabel: "Ludwig Wittgenstein",
          },
        });
      });
    });
  });
});
