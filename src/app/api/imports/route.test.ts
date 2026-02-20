import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/data/repositories/importJobRepository", () => ({
  createImportJob: vi.fn(),
  getImportJobsByUserId: vi.fn(),
}));

vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("~/worker/jobs/import-history.job", () => ({
  processImportJob: vi.fn().mockResolvedValue(undefined),
}));

import { POST, GET } from "./route";
import { createImportJob, getImportJobsByUserId } from "~/server/data/repositories/importJobRepository";
import { auth } from "~/server/auth";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockCreateImportJob = createImportJob as ReturnType<typeof vi.fn>;
const mockGetImportJobsByUserId = getImportJobsByUserId as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

const authenticatedSession = {
  user: { id: "user-1", name: "Test User", email: "test@example.com" },
};

const mockJob = {
  id: "job-1",
  userId: "user-1",
  status: "pending",
  progress: 0,
  totalItems: null,
  processedItems: 0,
  errorMessage: null,
  errorDetails: null,
  startedAt: null,
  completedAt: null,
  createdAt: new Date("2026-01-15T10:00:00Z"),
  updatedAt: new Date("2026-01-15T10:00:00Z"),
};

describe("POST /api/imports", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/imports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("authentication_error");
    expect(body.meta.requestId).toBeDefined();
  });

  it("creates an import job and returns 201 with envelope", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockCreateImportJob.mockResolvedValueOnce(mockJob);

    const request = new Request("http://localhost/api/imports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.id).toBe("job-1");
    expect(body.data.status).toBe("pending");
    expect(body.meta.requestId).toBeDefined();
    expect(body.meta.timestamp).toBeDefined();
    expect(mockCreateImportJob).toHaveBeenCalledWith("user-1");
  });

  it("works with empty body", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockCreateImportJob.mockResolvedValueOnce(mockJob);

    const request = new Request("http://localhost/api/imports", {
      method: "POST",
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});

describe("GET /api/imports", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("authentication_error");
  });

  it("returns user's own import jobs in envelope format", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetImportJobsByUserId.mockResolvedValueOnce([mockJob]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("job-1");
    expect(body.meta.requestId).toBeDefined();
    expect(mockGetImportJobsByUserId).toHaveBeenCalledWith("user-1");
  });

  it("returns empty array when user has no jobs", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetImportJobsByUserId.mockResolvedValueOnce([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });
});
