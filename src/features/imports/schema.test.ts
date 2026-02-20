import { describe, it, expect } from "vitest";
import {
  createImportJobSchema,
  importJobResponseSchema,
  importJobListResponseSchema,
} from "./schema";

describe("imports Zod schemas", () => {
  describe("createImportJobSchema", () => {
    it("accepts undefined (no body)", () => {
      const result = createImportJobSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = createImportJobSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("importJobResponseSchema", () => {
    const validJob = {
      id: "clx123abc",
      userId: "user-1",
      status: "pending",
      progress: 0,
      totalItems: null,
      processedItems: 0,
      errorMessage: null,
      startedAt: null,
      completedAt: null,
      createdAt: "2026-01-15T10:00:00.000Z",
      updatedAt: "2026-01-15T10:00:00.000Z",
    };

    it("validates a correct import job response", () => {
      const result = importJobResponseSchema.safeParse(validJob);
      expect(result.success).toBe(true);
    });

    it("validates all status values", () => {
      for (const status of [
        "pending",
        "in_progress",
        "completed",
        "failed",
      ]) {
        const result = importJobResponseSchema.safeParse({
          ...validJob,
          status,
        });
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid status", () => {
      const result = importJobResponseSchema.safeParse({
        ...validJob,
        status: "cancelled",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing required fields", () => {
      const { id: _id, ...withoutId } = validJob;
      const result = importJobResponseSchema.safeParse(withoutId);
      expect(result.success).toBe(false);
    });

    it("rejects progress out of range", () => {
      const result = importJobResponseSchema.safeParse({
        ...validJob,
        progress: 101,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative progress", () => {
      const result = importJobResponseSchema.safeParse({
        ...validJob,
        progress: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("importJobListResponseSchema", () => {
    it("validates an array of import jobs", () => {
      const jobs = [
        {
          id: "job-1",
          userId: "user-1",
          status: "pending",
          progress: 0,
          totalItems: null,
          processedItems: 0,
          errorMessage: null,
          startedAt: null,
          completedAt: null,
          createdAt: "2026-01-15T10:00:00.000Z",
          updatedAt: "2026-01-15T10:00:00.000Z",
        },
      ];
      const result = importJobListResponseSchema.safeParse(jobs);
      expect(result.success).toBe(true);
    });

    it("validates empty array", () => {
      const result = importJobListResponseSchema.safeParse([]);
      expect(result.success).toBe(true);
    });
  });
});
