import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/db", () => {
  return {
    db: {
      importJob: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

import {
  createImportJob,
  getImportJobById,
  getImportJobsByUserId,
  updateImportJobStatus,
  updateImportJobProgress,
} from "./importJobRepository";
import { db } from "~/server/db";

const mock = db.importJob as unknown as {
  create: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  findMany: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("importJobRepository", () => {
  const userId = "user-1";
  const jobId = "job-1";

  describe("createImportJob", () => {
    it("creates a job with pending status for the given user", async () => {
      const mockJob = { id: jobId, userId, status: "pending" };
      mock.create.mockResolvedValueOnce(mockJob);

      const result = await createImportJob(userId);

      expect(mock.create).toHaveBeenCalledWith({ data: { userId } });
      expect(result).toEqual(mockJob);
    });
  });

  describe("getImportJobById", () => {
    it("returns the job when found", async () => {
      const mockJob = { id: jobId, userId, status: "pending" };
      mock.findUnique.mockResolvedValueOnce(mockJob);

      const result = await getImportJobById(jobId);

      expect(mock.findUnique).toHaveBeenCalledWith({ where: { id: jobId } });
      expect(result).toEqual(mockJob);
    });

    it("returns null when not found", async () => {
      mock.findUnique.mockResolvedValueOnce(null);

      const result = await getImportJobById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getImportJobsByUserId", () => {
    it("returns jobs ordered by createdAt desc", async () => {
      const mockJobs = [
        { id: "job-2", userId, status: "completed" },
        { id: "job-1", userId, status: "pending" },
      ];
      mock.findMany.mockResolvedValueOnce(mockJobs);

      const result = await getImportJobsByUserId(userId);

      expect(mock.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe("updateImportJobStatus", () => {
    it("updates status to in_progress with startedAt timestamp", async () => {
      mock.update.mockResolvedValueOnce({ id: jobId, status: "in_progress" });

      await updateImportJobStatus(jobId, "in_progress");

      expect(mock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: jobId },
          data: expect.objectContaining({ status: "in_progress" }),
        }),
      );
      const callData = mock.update.mock.calls[0]![0].data;
      expect(callData.startedAt).toBeInstanceOf(Date);
    });

    it("updates status to failed with error details and completedAt", async () => {
      mock.update.mockResolvedValueOnce({ id: jobId, status: "failed" });

      await updateImportJobStatus(jobId, "failed", {
        errorMessage: "Rate limit exceeded",
        errorDetails: { code: 429 },
      });

      const callData = mock.update.mock.calls[0]![0].data;
      expect(callData.status).toBe("failed");
      expect(callData.errorMessage).toBe("Rate limit exceeded");
      expect(callData.errorDetails).toEqual({ code: 429 });
      expect(callData.completedAt).toBeInstanceOf(Date);
    });

    it("updates status to completed with completedAt timestamp", async () => {
      mock.update.mockResolvedValueOnce({ id: jobId, status: "completed" });

      await updateImportJobStatus(jobId, "completed");

      const callData = mock.update.mock.calls[0]![0].data;
      expect(callData.completedAt).toBeInstanceOf(Date);
    });
  });

  describe("updateImportJobProgress", () => {
    it("calculates progress percentage from processed/total", async () => {
      mock.update.mockResolvedValueOnce({
        id: jobId,
        processedItems: 50,
        totalItems: 200,
        progress: 25,
      });

      await updateImportJobProgress(jobId, 50, 200);

      expect(mock.update).toHaveBeenCalledWith({
        where: { id: jobId },
        data: { processedItems: 50, totalItems: 200, progress: 25 },
      });
    });

    it("returns 0 progress when totalItems is 0", async () => {
      mock.update.mockResolvedValueOnce({
        id: jobId,
        processedItems: 0,
        totalItems: 0,
        progress: 0,
      });

      await updateImportJobProgress(jobId, 0, 0);

      expect(mock.update).toHaveBeenCalledWith({
        where: { id: jobId },
        data: { processedItems: 0, totalItems: 0, progress: 0 },
      });
    });
  });
});
