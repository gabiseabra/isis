// TOC:
// 1. strict JSON equality and inequality (=, !=) including null/object/array.
// 2. string operators (^=, $=, %=) for starts/ends/contains.
// 3. numeric comparisons (>, <, >=, <=, #=).
// 4. ISO date-string comparisons (>, <, >=, <=, #=).
// 5. boolean logic and grouping with and, or, parentheses.
// 6. mismatched type/nonexistent field returns false.
// 7. malformed expression rejects/throws.

import { UUID } from "@isis/common/dto/uuid";
import { shutDown } from "../services/runtime/shut-down";
import {
  setupDatabaseTest,
  tearDownDatabaseTest,
} from "../test-utils/setup-pg-client";
import { sqlOne } from "./sql";

const dbID = UUID.create();

beforeAll(async () => {
  await setupDatabaseTest(dbID);
});
afterAll(async () => {
  await tearDownDatabaseTest(dbID);
  await shutDown();
});

describe("jsonb_query_match", () => {
  describe("strict JSON equality and inequality", () => {
    it.each([
      ["matches null equality", "missingValue = null", true],
      ["matches object equality", 'profile = {"role":"admin","level":3}', true],
      ["matches array equality", 'tags = ["math","code"]', true],
      ["matches null inequality", 'missingValue != "value"', true],
      [
        "returns false for object inequality that is equal",
        'profile != {"level":3,"role":"admin"}',
        false,
      ],
      [
        "returns false for array equality with different order",
        'tags = ["code","math"]',
        false,
      ],
    ])("%s", async (_name, expression, expected) => {
      const row = await sqlOne<{ matched: boolean }>`
        select jsonb_query_match(
          '{
            "name": "Ada Lovelace",
            "count": 42,
            "createdAt": "2026-07-28T10:30:00Z",
            "active": true,
            "missingValue": null,
            "profile": {"role": "admin", "level": 3},
            "tags": ["math", "code"]
          }'::jsonb,
          ${expression}::text
        ) matched
      `;

      expect(row.matched).toBe(expected);
    });
  });

  describe("string operators", () => {
    it.each([
      ["matches starts with", 'name ^= "Ada"', true],
      ["returns false when start does not match", 'name ^= "Lovelace"', false],
      ["matches ends with", 'name $= "Lovelace"', true],
      ["returns false when end does not match", 'name $= "Ada"', false],
      ["matches contains", 'name %= "Love"', true],
      ["returns false when substring is missing", 'name %= "Byron"', false],
    ])("%s", async (_name, expression, expected) => {
      const row = await sqlOne<{ matched: boolean }>`
        select jsonb_query_match(
          '{
            "name": "Ada Lovelace",
            "count": 42,
            "createdAt": "2026-07-28T10:30:00Z",
            "active": true,
            "missingValue": null,
            "profile": {"role": "admin", "level": 3},
            "tags": ["math", "code"]
          }'::jsonb,
          ${expression}::text
        ) matched
      `;

      expect(row.matched).toBe(expected);
    });
  });

  describe("numeric comparisons", () => {
    it.each([
      ["matches greater than", "count > 41", true],
      ["matches less than", "count < 43", true],
      ["matches greater than or equal", "count >= 42", true],
      ["matches less than or equal", "count <= 42", true],
      ["matches numeric equality", "count #= 42", true],
      [
        "returns false when numeric greater-than comparison is not satisfied",
        "count > 42",
        false,
      ],
    ])("%s", async (_name, expression, expected) => {
      const row = await sqlOne<{ matched: boolean }>`
        select jsonb_query_match(
          '{
            "name": "Ada Lovelace",
            "count": 42,
            "createdAt": "2026-07-28T10:30:00Z",
            "active": true,
            "missingValue": null,
            "profile": {"role": "admin", "level": 3},
            "tags": ["math", "code"]
          }'::jsonb,
          ${expression}::text
        ) matched
      `;

      expect(row.matched).toBe(expected);
    });
  });

  describe("ISO date-string comparisons", () => {
    it.each([
      ["matches greater than", 'createdAt > "2026-07-28T10:29:59Z"', true],
      ["matches less than", 'createdAt < "2026-07-28T10:30:01Z"', true],
      [
        "matches greater than or equal",
        'createdAt >= "2026-07-28T10:30:00Z"',
        true,
      ],
      [
        "matches less than or equal",
        'createdAt <= "2026-07-28T10:30:00Z"',
        true,
      ],
      ["matches date equality", 'createdAt #= "2026-07-28T10:30:00Z"', true],
      [
        "returns false when date less-than comparison is not satisfied",
        'createdAt < "2026-07-28T10:30:00Z"',
        false,
      ],
    ])("%s", async (_name, expression, expected) => {
      const row = await sqlOne<{ matched: boolean }>`
        select jsonb_query_match(
          '{
            "name": "Ada Lovelace",
            "count": 42,
            "createdAt": "2026-07-28T10:30:00Z",
            "active": true,
            "missingValue": null,
            "profile": {"role": "admin", "level": 3},
            "tags": ["math", "code"]
          }'::jsonb,
          ${expression}::text
        ) matched
      `;

      expect(row.matched).toBe(expected);
    });
  });

  describe("boolean logic and grouping", () => {
    it.each([
      [
        "matches an and expression when both sides match",
        'name ^= "Ada" and count >= 42',
        true,
      ],
      [
        "returns false for an and expression when one side fails",
        'name ^= "Ada" and count > 42',
        false,
      ],
      [
        "matches an or expression when one side matches",
        'name = "Grace" or count #= 42',
        true,
      ],
      [
        "uses parentheses to group expressions",
        'name = "Grace" or (count #= 42 and active = true)',
        true,
      ],
      [
        "returns false when grouped expression fails",
        '(name = "Grace" or count > 42) and active = true',
        false,
      ],
    ])("%s", async (_name, expression, expected) => {
      const row = await sqlOne<{ matched: boolean }>`
        select jsonb_query_match(
          '{
            "name": "Ada Lovelace",
            "count": 42,
            "createdAt": "2026-07-28T10:30:00Z",
            "active": true,
            "missingValue": null,
            "profile": {"role": "admin", "level": 3},
            "tags": ["math", "code"]
          }'::jsonb,
          ${expression}::text
        ) matched
      `;

      expect(row.matched).toBe(expected);
    });
  });

  describe("mismatched type and nonexistent field", () => {
    it.each([
      [
        "returns false for a mismatched type comparison",
        'count %= "42"',
        false,
      ],
      [
        "returns false for a nonexistent field comparison",
        'unknown = "value"',
        false,
      ],
    ])("%s", async (_name, expression, expected) => {
      const row = await sqlOne<{ matched: boolean }>`
        select jsonb_query_match(
          '{
            "name": "Ada Lovelace",
            "count": 42,
            "createdAt": "2026-07-28T10:30:00Z",
            "active": true,
            "missingValue": null,
            "profile": {"role": "admin", "level": 3},
            "tags": ["math", "code"]
          }'::jsonb,
          ${expression}::text
        ) matched
      `;

      expect(row.matched).toBe(expected);
    });
  });

  describe("malformed expression", () => {
    it("rejects malformed expressions", async () => {
      await expect(sqlOne<{ matched: boolean }>`
        select jsonb_query_match(
          '{
            "name": "Ada Lovelace",
            "count": 42,
            "createdAt": "2026-07-28T10:30:00Z",
            "active": true,
            "missingValue": null,
            "profile": {"role": "admin", "level": 3},
            "tags": ["math", "code"]
          }'::jsonb,
          ${'name ~~ "Ada"'}::text
        ) matched
      `).rejects.toThrow(/Invalid jsonb query expression/);
    });
  });
});
