import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/db", () => ({ db: {} }));

vi.mock("~/server/data/repositories/importJobRepository", () => ({
  getImportJobById: vi.fn(),
}));

vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("~/worker/jobs/import-history.job", () => ({
  processImportJob: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./route";
import { getImportJobById } from "~/server/data/repositories/importJobRepository";
import { auth } from "~/server/auth";
import { processImportJob } from "~/worker/jobs/import-history.job";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockGetImportJobById = getImportJobById as ReturnType<typeof vi.fn>;
const mockProcessImportJob = processImportJob as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

const authenticatedSession = {
  user: { id: "user-1", name: "Test User", email: "test@example.com" },
};

const mockFailedJob = {
  id: "job-1",
  userId: "user-1",
  status: "failed",
  progress: 50,
  totalItems: 10,
  processedItems: 5,
  errorMessage: "Connection timeout",
  errorDetails: { attempts: 1, lastError: "Connection timeout" },
  startedAt: new Date("2026-01-15T10:00:00Z"),
  completedAt: new Date("2026-01-15T10:05:00Z"),
  createdAt: new Date("2026-01-15T10:00:00Z"),
  updatedAt: new Date("2026-01-15T10:05:00Z"),
};

function makeParams(importId: string) {
  return { params: Promise.resolve({ importId }) };
}

describe("POST /api/imports/[importId]/retry", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/imports/job-1/retry", {
      method: "POST",
    });
    const response = await POST(request, makeParams("job-1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("authentication_error");
  });

  it("returns 404 when job does not exist", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetImportJobById.mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/imports/nonexistent/retry", {
      method: "POST",
    });
    const response = await POST(request, makeParams("nonexistent"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("not_found");
  });

  it("returns 404 when job belongs to another user", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetImportJobById.mockResolvedValueOnce({
      ...mockFailedJob,
      userId: "other-user",
    });

    const request = new Request("http://localhost/api/imports/job-1/retry", {
      method: "POST",
    });
    const response = await POST(request, makeParams("job-1"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("not_found");
  });

  it("returns 400 when job status is not failed", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetImportJobById.mockResolvedValueOnce({
      ...mockFailedJob,
      status: "completed",
    });

    const request = new Request("http://localhost/api/imports/job-1/retry", {
      method: "POST",
    });
    const response = await POST(request, makeParams("job-1"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("validation_error");
    expect(body.error.message).toContain("Only failed import jobs");
  });

  it("returns 400 when max retry attempts exceeded", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetImportJobById.mockResolvedValueOnce({
      ...mockFailedJob,
      errorDetails: { attempts: 3, lastError: "3rd failure" },
    });

    const request = new Request("http://localhost/api/imports/job-1/retry", {
      method: "POST",
    });
    const response = await POST(request, makeParams("job-1"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("validation_error");
    expect(body.error.message).toContain("maximum retry attempts");
  });

  it("triggers processImportJob and returns 202 for valid retry", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetImportJobById.mockResolvedValueOnce(mockFailedJob);

    const request = new Request("http://localhost/api/imports/job-1/retry", {
      method: "POST",
    });
    const response = await POST(request, makeParams("job-1"));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.data.id).toBe("job-1");
    expect(body.data.status).toBe("retrying");
    expect(mockProcessImportJob).toHaveBeenCalledWith("job-1");
  });

  it("returns 202 even with null errorDetails (first retry)", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetImportJobById.mockResolvedValueOnce({
      ...mockFailedJob,
      errorDetails: null,
    });

    const request = new Request("http://localhost/api/imports/job-1/retry", {
      method: "POST",
    });
    const response = await POST(request, makeParams("job-1"));

    expect(response.status).toBe(202);
    expect(mockProcessImportJob).toHaveBeenCalledWith("job-1");
  });
});
