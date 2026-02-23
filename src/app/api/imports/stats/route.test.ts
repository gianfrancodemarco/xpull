import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("~/server/data/repositories/gitEventRepository", () => ({
  getGitEventStats: vi.fn(),
}));

vi.mock("~/shared/lib/correlation-id", () => ({
  createRequestId: () => "test-request-id",
}));

import { GET } from "./route";
import { auth } from "~/server/auth";
import { getGitEventStats } from "~/server/data/repositories/gitEventRepository";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockGetGitEventStats = getGitEventStats as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/imports/stats", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("authentication_error");
  });

  it("returns 401 when session has no user id", async () => {
    mockAuth.mockResolvedValueOnce({ user: {} });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("authentication_error");
  });

  it("returns stats in envelope format for authenticated user", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockGetGitEventStats.mockResolvedValueOnce({
      totalRepositories: 12,
      totalCommits: 100,
      totalPullRequests: 25,
      totalReviews: 15,
      languages: [
        { language: "TypeScript", count: 50 },
        { language: "Python", count: 30 },
      ],
      earliestEventDate: new Date("2025-01-01T00:00:00.000Z"),
      latestEventDate: new Date("2026-02-01T00:00:00.000Z"),
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({
      totalRepositories: 12,
      totalCommits: 100,
      totalPullRequests: 25,
      totalReviews: 15,
      languages: [
        { language: "TypeScript", count: 50 },
        { language: "Python", count: 30 },
      ],
      earliestEventDate: "2025-01-01T00:00:00.000Z",
      latestEventDate: "2026-02-01T00:00:00.000Z",
    });
    expect(body.meta).toBeDefined();
    expect(body.meta.requestId).toBeDefined();
    expect(body.meta.timestamp).toBeDefined();
  });

  it("returns null dates when no events exist", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockGetGitEventStats.mockResolvedValueOnce({
      totalRepositories: 0,
      totalCommits: 0,
      totalPullRequests: 0,
      totalReviews: 0,
      languages: [],
      earliestEventDate: null,
      latestEventDate: null,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.earliestEventDate).toBeNull();
    expect(body.data.latestEventDate).toBeNull();
    expect(body.data.totalCommits).toBe(0);
  });

  it("calls getGitEventStats with the authenticated user id", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-42" } });
    mockGetGitEventStats.mockResolvedValueOnce({
      totalRepositories: 0,
      totalCommits: 0,
      totalPullRequests: 0,
      totalReviews: 0,
      languages: [],
      earliestEventDate: null,
      latestEventDate: null,
    });

    await GET();

    expect(mockGetGitEventStats).toHaveBeenCalledWith("user-42");
  });

  it("never includes repository names in response", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockGetGitEventStats.mockResolvedValueOnce({
      totalRepositories: 3,
      totalCommits: 5,
      totalPullRequests: 2,
      totalReviews: 1,
      languages: [{ language: "TypeScript", count: 5 }],
      earliestEventDate: new Date("2025-06-01T00:00:00.000Z"),
      latestEventDate: new Date("2026-01-01T00:00:00.000Z"),
    });

    const response = await GET();
    const body = await response.json();
    const bodyString = JSON.stringify(body);

    expect(bodyString).not.toContain("repositoryName");
    expect(bodyString).not.toContain("repoName");
    expect(bodyString).not.toContain("filePath");
  });
});
