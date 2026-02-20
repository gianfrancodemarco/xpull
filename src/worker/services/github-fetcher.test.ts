import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchUserRepositories,
  fetchRepositoryCommits,
  fetchRepositoryPullRequests,
  fetchPullRequestReviews,
  detectLanguages,
} from "./github-fetcher";
import type { Octokit } from "@octokit/rest";
import { GitHubRateLimiter } from "~/server/lib/rate-limiter";

function createMockOctokit(overrides: Record<string, unknown> = {}): Octokit {
  return {
    paginate: vi.fn(),
    rest: {
      repos: {
        listForAuthenticatedUser: vi.fn().mockResolvedValue({
          data: [],
          headers: {
            "x-ratelimit-remaining": "4900",
            "x-ratelimit-limit": "5000",
            "x-ratelimit-reset": "9999999999",
          },
        }),
        listCommits: vi.fn().mockResolvedValue({
          data: [],
          headers: {
            "x-ratelimit-remaining": "4900",
            "x-ratelimit-limit": "5000",
            "x-ratelimit-reset": "9999999999",
          },
        }),
      },
      pulls: {
        list: vi.fn().mockResolvedValue({
          data: [],
          headers: {
            "x-ratelimit-remaining": "4900",
            "x-ratelimit-limit": "5000",
            "x-ratelimit-reset": "9999999999",
          },
        }),
        listReviews: vi.fn().mockResolvedValue({
          data: [],
          headers: {
            "x-ratelimit-remaining": "4900",
            "x-ratelimit-limit": "5000",
            "x-ratelimit-reset": "9999999999",
          },
        }),
      },
    },
    ...overrides,
  } as unknown as Octokit;
}

describe("fetchUserRepositories", () => {
  let rateLimiter: GitHubRateLimiter;

  beforeEach(() => {
    rateLimiter = new GitHubRateLimiter();
  });

  it("returns normalized repository data", async () => {
    const mockRepos = [
      {
        id: 123,
        owner: { login: "testuser" },
        private: false,
        default_branch: "main",
        language: "TypeScript",
      },
      {
        id: 456,
        owner: { login: "testuser" },
        private: true,
        default_branch: "develop",
        language: null,
      },
    ];

    const octokit = createMockOctokit();
    vi.mocked(octokit.paginate).mockResolvedValue(mockRepos);

    const result = await fetchUserRepositories(octokit, rateLimiter);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      externalId: "123",
      ownerLogin: "testuser",
      isPrivate: false,
      defaultBranch: "main",
      primaryLanguage: "TypeScript",
    });
    expect(result[1]).toEqual({
      externalId: "456",
      ownerLogin: "testuser",
      isPrivate: true,
      defaultBranch: "develop",
      primaryLanguage: null,
    });
  });

  it("calls paginate with correct params", async () => {
    const octokit = createMockOctokit();
    vi.mocked(octokit.paginate).mockResolvedValue([]);

    await fetchUserRepositories(octokit, rateLimiter);

    expect(octokit.paginate).toHaveBeenCalledWith(
      octokit.rest.repos.listForAuthenticatedUser,
      { per_page: 100, type: "owner" },
    );
  });

  it("updates rate limiter from response headers", async () => {
    const octokit = createMockOctokit();
    vi.mocked(octokit.paginate).mockResolvedValue([]);

    const handleSpy = vi.spyOn(rateLimiter, "handleResponse");
    await fetchUserRepositories(octokit, rateLimiter);

    expect(handleSpy).toHaveBeenCalled();
  });
});

describe("fetchRepositoryCommits", () => {
  let rateLimiter: GitHubRateLimiter;

  beforeEach(() => {
    rateLimiter = new GitHubRateLimiter();
  });

  it("returns normalized commit data", async () => {
    const mockCommits = [
      {
        sha: "abc123",
        author: { login: "testuser" },
        commit: {
          author: { date: "2026-01-15T10:00:00Z" },
          committer: null,
          message: "feat: add feature",
        },
        stats: { additions: 50, deletions: 10 },
        files: [
          { filename: "src/index.ts" },
          { filename: "src/utils.py" },
        ],
      },
    ];

    const octokit = createMockOctokit();
    vi.mocked(octokit.paginate).mockResolvedValue(mockCommits);

    const result = await fetchRepositoryCommits(
      octokit, "owner", "repo", rateLimiter,
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.sha).toBe("abc123");
    expect(result[0]!.authorLogin).toBe("testuser");
    expect(result[0]!.linesAdded).toBe(50);
    expect(result[0]!.linesRemoved).toBe(10);
    expect(result[0]!.filesChanged).toBe(2);
    expect(result[0]!.messageLength).toBe("feat: add feature".length);
    expect(result[0]!.languages).toEqual(
      expect.arrayContaining([
        { language: "TypeScript", bytes: 1 },
        { language: "Python", bytes: 1 },
      ]),
    );
  });

  it("passes since parameter when provided", async () => {
    const octokit = createMockOctokit();
    vi.mocked(octokit.paginate).mockResolvedValue([]);

    const since = new Date("2026-01-01");
    await fetchRepositoryCommits(octokit, "owner", "repo", rateLimiter, since);

    expect(octokit.paginate).toHaveBeenCalledWith(
      octokit.rest.repos.listCommits,
      expect.objectContaining({ since: since.toISOString() }),
    );
  });
});

describe("fetchRepositoryPullRequests", () => {
  let rateLimiter: GitHubRateLimiter;

  beforeEach(() => {
    rateLimiter = new GitHubRateLimiter();
  });

  it("returns only merged PRs", async () => {
    const mockPRs = [
      {
        number: 1,
        id: 100,
        title: "feat: merged PR",
        merged_at: "2026-01-15T10:00:00Z",
        additions: 20,
        deletions: 5,
        changed_files: 3,
      },
      {
        number: 2,
        id: 200,
        title: "feat: closed but not merged",
        merged_at: null,
        additions: 10,
        deletions: 2,
        changed_files: 1,
      },
    ];

    const octokit = createMockOctokit();
    vi.mocked(octokit.paginate).mockResolvedValue(mockPRs);

    const result = await fetchRepositoryPullRequests(
      octokit, "owner", "repo", rateLimiter,
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.number).toBe(1);
    expect(result[0]!.externalId).toBe("100");
    expect(result[0]!.titleLength).toBe("feat: merged PR".length);
  });

  it("filters by since date", async () => {
    const mockPRs = [
      {
        number: 1, id: 100, title: "New PR",
        merged_at: "2026-02-01T10:00:00Z",
        additions: 10, deletions: 5, changed_files: 2,
      },
      {
        number: 2, id: 200, title: "Old PR",
        merged_at: "2025-12-01T10:00:00Z",
        additions: 5, deletions: 2, changed_files: 1,
      },
    ];

    const octokit = createMockOctokit();
    vi.mocked(octokit.paginate).mockResolvedValue(mockPRs);

    const since = new Date("2026-01-01");
    const result = await fetchRepositoryPullRequests(
      octokit, "owner", "repo", rateLimiter, since,
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.number).toBe(1);
  });
});

describe("fetchPullRequestReviews", () => {
  let rateLimiter: GitHubRateLimiter;

  beforeEach(() => {
    rateLimiter = new GitHubRateLimiter();
  });

  it("returns normalized review data", async () => {
    const mockReviews = [
      {
        id: 999,
        state: "APPROVED",
        submitted_at: "2026-01-15T12:00:00Z",
      },
    ];

    const octokit = createMockOctokit();
    (octokit.rest.pulls.listReviews as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockReviews,
      headers: {
        "x-ratelimit-remaining": "4800",
        "x-ratelimit-limit": "5000",
        "x-ratelimit-reset": "9999999999",
      },
    });

    const result = await fetchPullRequestReviews(
      octokit, "owner", "repo", 1, rateLimiter,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      externalId: "999",
      prNumber: 1,
      state: "APPROVED",
      submittedAt: new Date("2026-01-15T12:00:00Z"),
    });
  });
});

describe("detectLanguages", () => {
  it("detects TypeScript from .ts files", () => {
    const result = detectLanguages([
      { filename: "src/index.ts" },
      { filename: "src/utils.ts" },
    ]);

    expect(result).toEqual([{ language: "TypeScript", bytes: 2 }]);
  });

  it("detects multiple languages", () => {
    const result = detectLanguages([
      { filename: "src/index.ts" },
      { filename: "scripts/run.py" },
      { filename: "docs/readme.md" },
    ]);

    expect(result).toHaveLength(3);
    expect(result).toEqual(
      expect.arrayContaining([
        { language: "TypeScript", bytes: 1 },
        { language: "Python", bytes: 1 },
        { language: "Markdown", bytes: 1 },
      ]),
    );
  });

  it("ignores files with unknown extensions", () => {
    const result = detectLanguages([
      { filename: "binary.bin" },
      { filename: "noext" },
    ]);

    expect(result).toEqual([]);
  });

  it("aggregates multiple files of the same language", () => {
    const result = detectLanguages([
      { filename: "a.ts" },
      { filename: "b.tsx" },
      { filename: "c.ts" },
    ]);

    expect(result).toEqual([{ language: "TypeScript", bytes: 3 }]);
  });

  it("handles empty file list", () => {
    const result = detectLanguages([]);
    expect(result).toEqual([]);
  });
});
