import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("~/server/lib/github-token", () => ({
  getGitHubAccessToken: vi.fn(),
}));

vi.mock("~/server/lib/github-client", () => ({
  createGitHubClient: vi.fn(),
}));

import { GET } from "./route";
import { auth } from "~/server/auth";
import { getGitHubAccessToken } from "~/server/lib/github-token";
import { createGitHubClient } from "~/server/lib/github-client";
import { AppError, AppErrorCode } from "~/shared/lib/errors";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockGetToken = getGitHubAccessToken as ReturnType<typeof vi.fn>;
const mockCreateClient = createGitHubClient as ReturnType<typeof vi.fn>;

const authenticatedSession = {
  user: { id: "user-1", name: "Test User", email: "test@example.com" },
};

const mockGitHubRepos = [
  {
    name: "repo-one",
    full_name: "user/repo-one",
    language: "TypeScript",
    stargazers_count: 42,
    private: false,
    updated_at: "2026-02-20T12:00:00Z",
  },
  {
    name: "repo-two",
    full_name: "user/repo-two",
    language: null,
    stargazers_count: 0,
    private: true,
    updated_at: "2026-02-19T08:00:00Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/repos", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("authentication_error");
    expect(body.meta.requestId).toBeDefined();
  });

  it("returns repos in envelope format", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetToken.mockResolvedValueOnce("ghp_token123");

    const mockPaginate = vi.fn().mockResolvedValueOnce(mockGitHubRepos);
    const mockOctokit = {
      paginate: mockPaginate,
      rest: { repos: { listForAuthenticatedUser: "listForAuthenticatedUser" } },
    };
    mockCreateClient.mockReturnValueOnce(mockOctokit);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toEqual({
      name: "repo-one",
      fullName: "user/repo-one",
      language: "TypeScript",
      stars: 42,
      isPrivate: false,
      updatedAt: "2026-02-20T12:00:00Z",
    });
    expect(body.data[1]).toEqual({
      name: "repo-two",
      fullName: "user/repo-two",
      language: null,
      stars: 0,
      isPrivate: true,
      updatedAt: "2026-02-19T08:00:00Z",
    });
    expect(body.meta.requestId).toBeDefined();
    expect(body.meta.timestamp).toBeDefined();
  });

  it("calls paginate with correct parameters for pagination support", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetToken.mockResolvedValueOnce("ghp_token123");

    const mockPaginate = vi.fn().mockResolvedValueOnce([]);
    const listFn = vi.fn();
    const mockOctokit = {
      paginate: mockPaginate,
      rest: { repos: { listForAuthenticatedUser: listFn } },
    };
    mockCreateClient.mockReturnValueOnce(mockOctokit);

    await GET();

    expect(mockPaginate).toHaveBeenCalledWith(listFn, {
      per_page: 100,
      sort: "updated",
      direction: "desc",
    });
  });

  it("returns 401 when GitHub token not found", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetToken.mockRejectedValueOnce(
      new AppError(AppErrorCode.Authentication, "No GitHub access token found"),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("authentication_error");
  });

  it("returns 500 on unexpected errors", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetToken.mockRejectedValueOnce(new Error("Network failure"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe("unknown_error");
    expect(body.error.message).toBe("Failed to fetch repositories");
  });

  it("returns empty array when user has no repos", async () => {
    mockAuth.mockResolvedValueOnce(authenticatedSession);
    mockGetToken.mockResolvedValueOnce("ghp_token123");

    const mockPaginate = vi.fn().mockResolvedValueOnce([]);
    const mockOctokit = {
      paginate: mockPaginate,
      rest: { repos: { listForAuthenticatedUser: "listForAuthenticatedUser" } },
    };
    mockCreateClient.mockReturnValueOnce(mockOctokit);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });
});
