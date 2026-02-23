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

function createMockOctokit(): Octokit {
  return {
    paginate: vi.fn(),
    rest: {
      repos: {
        listForAuthenticatedUser: vi.fn().mockResolvedValue({
          data: [],
          headers: { "x-ratelimit-remaining": "4900", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "9999999999" },
        }),
        listCommits: vi.fn().mockResolvedValue({
          data: [],
          headers: { "x-ratelimit-remaining": "4900", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "9999999999" },
        }),
      },
      pulls: {
        list: vi.fn().mockResolvedValue({
          data: [],
          headers: { "x-ratelimit-remaining": "4900", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "9999999999" },
        }),
        listReviews: vi.fn().mockResolvedValue({
          data: [],
          headers: { "x-ratelimit-remaining": "4900", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "9999999999" },
        }),
      },
    },
  } as unknown as Octokit;
}

describe("GitHub Fetcher Integration Tests", () => {
  let rateLimiter: GitHubRateLimiter;

  beforeEach(() => {
    rateLimiter = new GitHubRateLimiter();
  });

  describe("pagination across multiple pages", () => {
    it("fetches all repos via paginate (simulating multi-page)", async () => {
      const octokit = createMockOctokit();
      const allRepos = Array.from({ length: 250 }, (_, i) => ({
        id: i + 1,
        name: `repo-${i + 1}`,
        owner: { login: "testuser" },
        private: i % 5 === 0,
        default_branch: "main",
        language: i % 2 === 0 ? "TypeScript" : "Python",
      }));

      vi.mocked(octokit.paginate).mockResolvedValue(allRepos);

      const result = await fetchUserRepositories(octokit, rateLimiter);

      expect(result).toHaveLength(250);
      expect(result.every((r) => r.externalId && r.ownerLogin === "testuser")).toBe(true);
    });

    it("fetches commits across multiple pages", async () => {
      const octokit = createMockOctokit();
      const allCommits = Array.from({ length: 350 }, (_, i) => ({
        sha: `sha-${i}`,
        author: { login: "dev" },
        commit: {
          author: { date: new Date(2026, 0, 1 + (i % 28)).toISOString() },
          committer: null,
          message: `commit message ${i}`,
        },
        stats: { additions: i * 2, deletions: i },
        files: [{ filename: `file-${i}.ts` }],
      }));

      vi.mocked(octokit.paginate).mockResolvedValue(allCommits);

      const result = await fetchRepositoryCommits(octokit, "owner", "repo", rateLimiter);

      expect(result).toHaveLength(350);
      expect(result[0]!.sha).toBe("sha-0");
      expect(result[349]!.sha).toBe("sha-349");
    });
  });

  describe("rate limit header handling", () => {
    it("updates rate limiter from repository fetch", async () => {
      const octokit = createMockOctokit();
      vi.mocked(octokit.paginate).mockResolvedValue([]);

      const handleSpy = vi.spyOn(rateLimiter, "handleResponse");
      await fetchUserRepositories(octokit, rateLimiter);

      expect(handleSpy).toHaveBeenCalled();
    });

    it("checks rate limit before each fetch call", async () => {
      const octokit = createMockOctokit();
      vi.mocked(octokit.paginate).mockResolvedValue([]);

      const shouldPauseSpy = vi.spyOn(rateLimiter, "shouldPause");
      await fetchRepositoryCommits(octokit, "owner", "repo", rateLimiter);

      expect(shouldPauseSpy).toHaveBeenCalled();
    });

    it("waits for reset when rate limit threshold is reached", async () => {
      const octokit = createMockOctokit();
      vi.mocked(octokit.paginate).mockResolvedValue([]);

      const shouldPauseSpy = vi.spyOn(rateLimiter, "shouldPause").mockReturnValue(true);
      const waitSpy = vi.spyOn(rateLimiter, "waitForReset").mockResolvedValue(undefined);

      await fetchRepositoryPullRequests(octokit, "owner", "repo", rateLimiter);

      expect(shouldPauseSpy).toHaveBeenCalled();
      expect(waitSpy).toHaveBeenCalled();
    });
  });

  describe("language detection integration", () => {
    it("correctly detects languages from real commit file lists", () => {
      const files = [
        { filename: "src/components/Button.tsx" },
        { filename: "src/components/Button.test.tsx" },
        { filename: "src/styles/global.css" },
        { filename: "scripts/deploy.sh" },
        { filename: "README.md" },
        { filename: "package.json" },
        { filename: "server/app.py" },
        { filename: "server/utils.py" },
        { filename: "Makefile" },
      ];

      const result = detectLanguages(files);

      const tsEntry = result.find((r) => r.language === "TypeScript");
      const cssEntry = result.find((r) => r.language === "CSS");
      const shellEntry = result.find((r) => r.language === "Shell");
      const mdEntry = result.find((r) => r.language === "Markdown");
      const jsonEntry = result.find((r) => r.language === "JSON");
      const pyEntry = result.find((r) => r.language === "Python");

      expect(tsEntry).toEqual({ language: "TypeScript", bytes: 2 });
      expect(cssEntry).toEqual({ language: "CSS", bytes: 1 });
      expect(shellEntry).toEqual({ language: "Shell", bytes: 1 });
      expect(mdEntry).toEqual({ language: "Markdown", bytes: 1 });
      expect(jsonEntry).toEqual({ language: "JSON", bytes: 1 });
      expect(pyEntry).toEqual({ language: "Python", bytes: 2 });
    });
  });

  describe("review fetching for pull requests", () => {
    it("fetches reviews and normalizes them", async () => {
      const octokit = createMockOctokit();
      (octokit.rest.pulls.listReviews as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [
          { id: 1001, state: "APPROVED", submitted_at: "2026-01-15T10:00:00Z" },
          { id: 1002, state: "CHANGES_REQUESTED", submitted_at: "2026-01-16T10:00:00Z" },
          { id: 1003, state: "COMMENTED", submitted_at: "2026-01-17T10:00:00Z" },
        ],
        headers: { "x-ratelimit-remaining": "4800", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "9999999999" },
      });

      const result = await fetchPullRequestReviews(octokit, "owner", "repo", 42, rateLimiter);

      expect(result).toHaveLength(3);
      expect(result[0]!.state).toBe("APPROVED");
      expect(result[1]!.state).toBe("CHANGES_REQUESTED");
      expect(result[2]!.state).toBe("COMMENTED");
      expect(result[0]!.prNumber).toBe(42);
    });
  });
});
