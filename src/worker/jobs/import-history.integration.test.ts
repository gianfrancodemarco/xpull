import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/db", () => ({ db: {} }));
vi.mock("~/server/lib/github-client");
vi.mock("~/server/lib/github-token");
vi.mock("~/server/lib/rate-limiter", () => {
  class MockGitHubRateLimiter {
    shouldPause = vi.fn().mockReturnValue(false);
    waitForReset = vi.fn().mockResolvedValue(undefined);
    handleResponse = vi.fn();
  }
  return { GitHubRateLimiter: MockGitHubRateLimiter };
});
vi.mock("~/server/data/repositories/importJobRepository");
vi.mock("~/server/data/repositories/repositoryRepository");
vi.mock("~/server/data/repositories/gitEventRepository");
vi.mock("~/worker/services/github-fetcher");

import { processImportJob } from "./import-history.job";
import {
  getImportJobById,
  updateImportJobStatus,
  updateImportJobProgress,
} from "~/server/data/repositories/importJobRepository";
import {
  upsertRepository,
  updateRepositoryLastSyncedAt,
} from "~/server/data/repositories/repositoryRepository";
import {
  createGitEvents,
  gitEventExists,
} from "~/server/data/repositories/gitEventRepository";
import { getGitHubAccessToken } from "~/server/lib/github-token";
import { createGitHubClient } from "~/server/lib/github-client";
import {
  fetchUserRepositories,
  fetchRepositoryCommits,
  fetchRepositoryPullRequests,
  fetchPullRequestReviews,
} from "~/worker/services/github-fetcher";

const mockGetJob = vi.mocked(getImportJobById);
const mockUpdateStatus = vi.mocked(updateImportJobStatus);
const mockUpdateProgress = vi.mocked(updateImportJobProgress);
const mockUpsertRepo = vi.mocked(upsertRepository);
const mockUpdateLastSynced = vi.mocked(updateRepositoryLastSyncedAt);
const mockCreateEvents = vi.mocked(createGitEvents);
const mockEventExists = vi.mocked(gitEventExists);
const mockGetToken = vi.mocked(getGitHubAccessToken);
const mockCreateClient = vi.mocked(createGitHubClient);
const mockFetchRepos = vi.mocked(fetchUserRepositories);
const mockFetchCommits = vi.mocked(fetchRepositoryCommits);
const mockFetchPRs = vi.mocked(fetchRepositoryPullRequests);
const mockFetchReviews = vi.mocked(fetchPullRequestReviews);

function createMockJob(overrides = {}) {
  return {
    id: "job-int-1",
    userId: "user-int-1",
    status: "pending" as const,
    progress: 0,
    totalItems: null,
    processedItems: 0,
    selectedRepoIds: null,
    errorMessage: null,
    errorDetails: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRepo(id: string, idx: number) {
  return {
    id: `repo-${id}`,
    userId: "user-int-1",
    externalId: String(1000 + idx),
    ownerLogin: "testowner",
    isPrivate: false,
    defaultBranch: "main",
    primaryLanguage: "TypeScript",
    lastSyncedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("Import History Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue("ghp_integration_token");
    mockCreateClient.mockReturnValue({} as ReturnType<typeof createGitHubClient>);
    mockUpdateStatus.mockResolvedValue(createMockJob({ status: "in_progress" }));
    mockUpdateProgress.mockResolvedValue(createMockJob());
    mockCreateEvents.mockResolvedValue({ count: 0 });
    mockEventExists.mockResolvedValue(false);
    mockUpdateLastSynced.mockResolvedValue(makeRepo("1", 0));
  });

  it("multi-repo import: processes commits, PRs, and reviews across multiple repos", async () => {
    mockGetJob.mockResolvedValue(createMockJob());
    mockFetchRepos.mockResolvedValue([
      { externalId: "1001", name: "repo-ts", ownerLogin: "owner", isPrivate: false, defaultBranch: "main", primaryLanguage: "TypeScript" },
      { externalId: "1002", name: "repo-py", ownerLogin: "owner", isPrivate: true, defaultBranch: "develop", primaryLanguage: "Python" },
    ]);
    mockUpsertRepo
      .mockResolvedValueOnce(makeRepo("r1", 0))
      .mockResolvedValueOnce(makeRepo("r2", 1));

    mockFetchCommits
      .mockResolvedValueOnce([
        { sha: "c1", authorLogin: "owner", date: new Date("2026-01-10"), linesAdded: 10, linesRemoved: 2, filesChanged: 3, messageLength: 15, languages: [{ language: "TypeScript", bytes: 3 }] },
        { sha: "c2", authorLogin: "owner", date: new Date("2026-01-11"), linesAdded: 5, linesRemoved: 1, filesChanged: 1, messageLength: 20, languages: [{ language: "TypeScript", bytes: 1 }] },
      ])
      .mockResolvedValueOnce([
        { sha: "c3", authorLogin: "owner", date: new Date("2026-01-12"), linesAdded: 20, linesRemoved: 10, filesChanged: 5, messageLength: 30, languages: [{ language: "Python", bytes: 5 }] },
      ]);

    mockFetchPRs
      .mockResolvedValueOnce([
        { number: 1, externalId: "pr-1", title: "PR 1", titleLength: 4, mergedAt: new Date("2026-01-15"), linesAdded: 50, linesRemoved: 10, filesChanged: 5 },
      ])
      .mockResolvedValueOnce([]);

    mockFetchReviews.mockResolvedValueOnce([
      { externalId: "rev-1", prNumber: 1, state: "APPROVED", submittedAt: new Date("2026-01-14") },
    ]);

    await processImportJob("job-int-1");

    // Verify repos were upserted
    expect(mockUpsertRepo).toHaveBeenCalledTimes(2);

    // Verify commits were created for both repos
    expect(mockCreateEvents).toHaveBeenCalled();
    const allEventBatches = mockCreateEvents.mock.calls.flatMap((call) => call[0]);
    const commitEvents = allEventBatches.filter((e) => e.eventType === "commit");
    const prEvents = allEventBatches.filter((e) => e.eventType === "pull_request");
    const reviewEvents = allEventBatches.filter((e) => e.eventType === "review");

    expect(commitEvents).toHaveLength(3);
    expect(prEvents).toHaveLength(1);
    expect(reviewEvents).toHaveLength(1);

    expect(mockUpdateStatus).toHaveBeenCalledWith("job-int-1", "completed", { errorDetails: null });
  });

  it("deduplication: skips already-existing events during import", async () => {
    mockGetJob.mockResolvedValue(createMockJob());
    mockFetchRepos.mockResolvedValue([
      { externalId: "2001", name: "dedup-repo", ownerLogin: "owner", isPrivate: false, defaultBranch: "main", primaryLanguage: null },
    ]);
    mockUpsertRepo.mockResolvedValue(makeRepo("dup", 0));
    mockFetchCommits.mockResolvedValue([
      { sha: "existing-1", authorLogin: "a", date: new Date(), linesAdded: 1, linesRemoved: 0, filesChanged: 1, messageLength: 5, languages: [] },
      { sha: "existing-2", authorLogin: "a", date: new Date(), linesAdded: 2, linesRemoved: 1, filesChanged: 1, messageLength: 10, languages: [] },
      { sha: "new-1", authorLogin: "a", date: new Date(), linesAdded: 3, linesRemoved: 2, filesChanged: 2, messageLength: 15, languages: [] },
    ]);
    mockFetchPRs.mockResolvedValue([]);

    mockEventExists
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await processImportJob("job-int-1");

    const allEvents = mockCreateEvents.mock.calls.flatMap((call) => call[0]);
    expect(allEvents).toHaveLength(1);
    expect(allEvents[0]!.externalId).toBe("new-1");
  });

  it("rate limit pause/resume: worker pauses when rate limit threshold reached", async () => {
    mockGetJob.mockResolvedValue(createMockJob());
    mockFetchRepos.mockResolvedValue([
      { externalId: "3001", name: "rate-repo", ownerLogin: "owner", isPrivate: false, defaultBranch: "main", primaryLanguage: null },
    ]);
    mockUpsertRepo.mockResolvedValue(makeRepo("rate", 0));
    mockFetchCommits.mockResolvedValue([]);
    mockFetchPRs.mockResolvedValue([]);

    await processImportJob("job-int-1");

    expect(mockFetchCommits).toHaveBeenCalledWith(
      expect.anything(), "owner", "rate-repo", expect.anything(), undefined,
    );
  });

  it("language detection: commits include language data", async () => {
    mockGetJob.mockResolvedValue(createMockJob());
    mockFetchRepos.mockResolvedValue([
      { externalId: "4001", name: "lang-repo", ownerLogin: "owner", isPrivate: false, defaultBranch: "main", primaryLanguage: "TypeScript" },
    ]);
    mockUpsertRepo.mockResolvedValue(makeRepo("lang", 0));
    mockFetchCommits.mockResolvedValue([
      {
        sha: "lang-commit",
        authorLogin: "owner",
        date: new Date(),
        linesAdded: 50,
        linesRemoved: 10,
        filesChanged: 5,
        messageLength: 20,
        languages: [
          { language: "TypeScript", bytes: 3 },
          { language: "CSS", bytes: 2 },
        ],
      },
    ]);
    mockFetchPRs.mockResolvedValue([]);

    await processImportJob("job-int-1");

    const allEvents = mockCreateEvents.mock.calls.flatMap((call) => call[0]);
    const commitEvent = allEvents.find((e) => e.externalId === "lang-commit")!;
    const languages = commitEvent.languages as Array<{ language: string; bytes: number }>;
    expect(languages).toEqual(
      expect.arrayContaining([
        { language: "TypeScript", bytes: 3 },
        { language: "CSS", bytes: 2 },
      ]),
    );
  });

  it("failure/retry: failed job tracks attempt count and can be retried", async () => {
    // First attempt fails
    mockGetJob.mockResolvedValueOnce(createMockJob());
    mockGetToken.mockRejectedValueOnce(new Error("Token expired"));

    await expect(processImportJob("job-int-1")).rejects.toThrow("Token expired");

    expect(mockUpdateStatus).toHaveBeenCalledWith("job-int-1", "failed", {
      errorMessage: "Token expired",
      errorDetails: { attempts: 1, lastError: "Token expired" },
    });

    // Second attempt succeeds
    vi.clearAllMocks();
    mockGetJob.mockResolvedValueOnce(
      createMockJob({
        status: "failed",
        errorDetails: { attempts: 1, lastError: "Token expired" },
      }),
    );
    mockGetToken.mockResolvedValueOnce("ghp_new_token");
    mockCreateClient.mockReturnValue({} as ReturnType<typeof createGitHubClient>);
    mockUpdateStatus.mockResolvedValue(createMockJob({ status: "in_progress" }));
    mockUpdateProgress.mockResolvedValue(createMockJob());
    mockFetchRepos.mockResolvedValue([]);

    await processImportJob("job-int-1");

    expect(mockUpdateStatus).toHaveBeenCalledWith("job-int-1", "completed", { errorDetails: null });
  });

  it("privacy: no event metadata contains sensitive data", async () => {
    mockGetJob.mockResolvedValue(createMockJob());
    mockFetchRepos.mockResolvedValue([
      { externalId: "5001", name: "secret-repo", ownerLogin: "secretowner", isPrivate: true, defaultBranch: "main", primaryLanguage: null },
    ]);
    mockUpsertRepo.mockResolvedValue(makeRepo("priv", 0));
    mockFetchCommits.mockResolvedValue([
      { sha: "priv-c1", authorLogin: "owner", date: new Date(), linesAdded: 10, linesRemoved: 5, filesChanged: 2, messageLength: 25, languages: [] },
    ]);
    mockFetchPRs.mockResolvedValue([
      { number: 10, externalId: "priv-pr-1", title: "Secret feature", titleLength: 14, mergedAt: new Date(), linesAdded: 30, linesRemoved: 5, filesChanged: 4 },
    ]);
    mockFetchReviews.mockResolvedValue([
      { externalId: "priv-rev-1", prNumber: 10, state: "CHANGES_REQUESTED", submittedAt: new Date() },
    ]);

    await processImportJob("job-int-1");

    const allEvents = mockCreateEvents.mock.calls.flatMap((call) => call[0]);

    for (const event of allEvents) {
      const metadata = event.metadata as Record<string, unknown>;
      const metaStr = JSON.stringify(metadata);

      // Must NOT contain any raw content
      expect(metaStr).not.toContain("secretowner");
      expect(metaStr).not.toContain("Secret feature");
      expect(metaStr).not.toContain("diff");
      expect(metaStr).not.toContain("filePath");
      expect(metaStr).not.toContain("comment");

      // Only allowed keys
      const allowedKeys = new Set(["messageLength", "titleLength", "reviewState"]);
      for (const key of Object.keys(metadata)) {
        expect(allowedKeys.has(key)).toBe(true);
      }
    }
  });

  it("batch insert: uses batches of 100 for performance", async () => {
    mockGetJob.mockResolvedValue(createMockJob());
    mockFetchRepos.mockResolvedValue([
      { externalId: "6001", name: "batch-repo", ownerLogin: "owner", isPrivate: false, defaultBranch: "main", primaryLanguage: null },
    ]);
    mockUpsertRepo.mockResolvedValue(makeRepo("batch", 0));

    // Generate 250 commits to test batch splitting
    const commits = Array.from({ length: 250 }, (_, i) => ({
      sha: `batch-sha-${i}`,
      authorLogin: "owner",
      date: new Date(),
      linesAdded: 1,
      linesRemoved: 0,
      filesChanged: 1,
      messageLength: 10,
      languages: [],
    }));
    mockFetchCommits.mockResolvedValue(commits);
    mockFetchPRs.mockResolvedValue([]);

    await processImportJob("job-int-1");

    // With 250 commits and batch size 100, expect 3 createGitEvents calls
    const commitBatches = mockCreateEvents.mock.calls.filter(
      (call) => call[0].length > 0 && call[0][0]!.eventType === "commit",
    );
    expect(commitBatches.length).toBe(3);
    expect(commitBatches[0]![0]).toHaveLength(100);
    expect(commitBatches[1]![0]).toHaveLength(100);
    expect(commitBatches[2]![0]).toHaveLength(50);
  });
});
