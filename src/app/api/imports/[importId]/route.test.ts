import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/data/repositories/importJobRepository", () => ({
  getImportJobById: vi.fn(),
}));

vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

import { GET } from "./route";
import { getImportJobById } from "~/server/data/repositories/importJobRepository";
import { auth } from "~/server/auth";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockGetImportJobById = getImportJobById as ReturnType<typeof vi.fn>;

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

function makeParams(importId: string) {
  return { params: Promise.resolve({ importId }) };
}

describe("GET /api/imports/[importId]", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/imports/job-1");
    const response = await GET(request, makeParams("job-1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("authentication_error");
  });

  it("returns 404 when job does not exist", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetImportJobById.mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/imports/nonexistent");
    const response = await GET(request, makeParams("nonexistent"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("not_found");
  });

  it("returns 404 when job belongs to another user (ownership enforcement)", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetImportJobById.mockResolvedValueOnce({
      ...mockJob,
      userId: "other-user",
    });

    const request = new Request("http://localhost/api/imports/job-1");
    const response = await GET(request, makeParams("job-1"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("not_found");
  });

  it("returns the job in envelope format when owned by user", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetImportJobById.mockResolvedValueOnce(mockJob);

    const request = new Request("http://localhost/api/imports/job-1");
    const response = await GET(request, makeParams("job-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.id).toBe("job-1");
    expect(body.meta.requestId).toBeDefined();
    expect(body.meta.timestamp).toBeDefined();
  });
});
