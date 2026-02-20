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
    id: "job-1",
    userId: "user-1",
    status: "pending" as const,
    progress: 0,
    totalItems: null,
    processedItems: 0,
    errorMessage: null,
    errorDetails: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("processImportJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetToken.mockResolvedValue("ghp_test_token");
    mockCreateClient.mockReturnValue({} as ReturnType<typeof createGitHubClient>);
    mockUpdateStatus.mockResolvedValue(createMockJob({ status: "in_progress" }));
    mockUpdateProgress.mockResolvedValue(createMockJob());
    mockUpdateLastSynced.mockResolvedValue({
      id: "repo-1",
      userId: "user-1",
      externalId: "123",
      ownerLogin: "owner",
      isPrivate: false,
      defaultBranch: "main",
      primaryLanguage: "TypeScript",
      lastSyncedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockCreateEvents.mockResolvedValue({ count: 0 });
    mockEventExists.mockResolvedValue(false);
  });

  it("processes a pending job through full lifecycle (pending → in_progress → completed)", async () => {
    mockGetJob.mockResolvedValue(createMockJob());
    mockFetchRepos.mockResolvedValue([
      {
        externalId: "123",
        ownerLogin: "owner",
        isPrivate: false,
        defaultBranch: "main",
        primaryLanguage: "TypeScript",
      },
    ]);
    mockUpsertRepo.mockResolvedValue({
      id: "repo-1",
      userId: "user-1",
      externalId: "123",
      ownerLogin: "owner",
      isPrivate: false,
      defaultBranch: "main",
      primaryLanguage: "TypeScript",
      lastSyncedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockFetchCommits.mockResolvedValue([
      {
        sha: "abc123",
        authorLogin: "owner",
        date: new Date("2026-01-15"),
        linesAdded: 10,
        linesRemoved: 2,
        filesChanged: 1,
        messageLength: 15,
        languages: [{ language: "TypeScript", bytes: 1 }],
      },
    ]);
    mockFetchPRs.mockResolvedValue([]);
    mockFetchReviews.mockResolvedValue([]);

    await processImportJob("job-1");

    expect(mockUpdateStatus).toHaveBeenCalledWith("job-1", "in_progress");
    expect(mockCreateEvents).toHaveBeenCalled();
    expect(mockUpdateStatus).toHaveBeenCalledWith("job-1", "completed");
  });

  it("throws when job not found", async () => {
    mockGetJob.mockResolvedValue(null);

    await expect(processImportJob("nonexistent")).rejects.toThrow(
      "Import job nonexistent not found",
    );
  });

  it("throws when job status is not pending or failed", async () => {
    mockGetJob.mockResolvedValue(createMockJob({ status: "completed" }));

    await expect(processImportJob("job-1")).rejects.toThrow(
      "expected pending or failed",
    );
  });

  it("sets job to failed on error and records attempt count", async () => {
    mockGetJob.mockResolvedValue(createMockJob());
    mockGetToken.mockRejectedValue(new Error("No token"));

    await expect(processImportJob("job-1")).rejects.toThrow("No token");

    expect(mockUpdateStatus).toHaveBeenCalledWith("job-1", "failed", {
      errorMessage: "No token",
      errorDetails: { attempts: 1, lastError: "No token" },
    });
  });

  it("allows retry of a failed job (increments attempt count)", async () => {
    mockGetJob.mockResolvedValue(
      createMockJob({
        status: "failed",
        errorDetails: { attempts: 1, lastError: "previous error" },
      }),
    );
    mockFetchRepos.mockResolvedValue([]);

    await processImportJob("job-1");

    expect(mockUpdateStatus).toHaveBeenCalledWith("job-1", "completed");
  });

  it("rejects retry when max attempts exceeded", async () => {
    mockGetJob.mockResolvedValue(
      createMockJob({
        status: "failed",
        errorDetails: { attempts: 3, lastError: "3rd failure" },
      }),
    );

    await expect(processImportJob("job-1")).rejects.toThrow(
      "exceeded maximum retry attempts",
    );
  });

  it("deduplicates events using gitEventExists", async () => {
    mockGetJob.mockResolvedValue(createMockJob());
    mockFetchRepos.mockResolvedValue([
      { externalId: "123", ownerLogin: "owner", isPrivate: false, defaultBranch: "main", primaryLanguage: null },
    ]);
    mockUpsertRepo.mockResolvedValue({
      id: "repo-1", userId: "user-1", externalId: "123", ownerLogin: "owner",
      isPrivate: false, defaultBranch: "main", primaryLanguage: null,
      lastSyncedAt: null, createdAt: new Date(), updatedAt: new Date(),
    });
    mockFetchCommits.mockResolvedValue([
      { sha: "existing-sha", authorLogin: "owner", date: new Date(), linesAdded: 1, linesRemoved: 0, filesChanged: 1, messageLength: 5, languages: [] },
      { sha: "new-sha", authorLogin: "owner", date: new Date(), linesAdded: 2, linesRemoved: 1, filesChanged: 1, messageLength: 10, languages: [] },
    ]);
    mockFetchPRs.mockResolvedValue([]);
    mockEventExists
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await processImportJob("job-1");

    const createCall = mockCreateEvents.mock.calls[0]![0];
    expect(createCall).toHaveLength(1);
    expect(createCall[0]!.externalId).toBe("new-sha");
  });

  it("stores only privacy-safe metadata for commits", async () => {
    mockGetJob.mockResolvedValue(createMockJob());
    mockFetchRepos.mockResolvedValue([
      { externalId: "123", ownerLogin: "owner", isPrivate: false, defaultBranch: "main", primaryLanguage: null },
    ]);
    mockUpsertRepo.mockResolvedValue({
      id: "repo-1", userId: "user-1", externalId: "123", ownerLogin: "owner",
      isPrivate: false, defaultBranch: "main", primaryLanguage: null,
      lastSyncedAt: null, createdAt: new Date(), updatedAt: new Date(),
    });
    mockFetchCommits.mockResolvedValue([
      { sha: "sha1", authorLogin: "owner", date: new Date(), linesAdded: 5, linesRemoved: 2, filesChanged: 1, messageLength: 20, languages: [] },
    ]);
    mockFetchPRs.mockResolvedValue([]);

    await processImportJob("job-1");

    const eventData = mockCreateEvents.mock.calls[0]![0][0]!;
    const metadata = eventData.metadata as Record<string, unknown>;
    expect(metadata).toEqual({ messageLength: 20 });
    expect(metadata).not.toHaveProperty("message");
    expect(metadata).not.toHaveProperty("diff");
    expect(metadata).not.toHaveProperty("filePaths");
  });

  it("updates progress after processing each repository", async () => {
    mockGetJob.mockResolvedValue(createMockJob());
    mockFetchRepos.mockResolvedValue([
      { externalId: "1", ownerLogin: "o", isPrivate: false, defaultBranch: "main", primaryLanguage: null },
      { externalId: "2", ownerLogin: "o", isPrivate: false, defaultBranch: "main", primaryLanguage: null },
    ]);
    mockUpsertRepo
      .mockResolvedValueOnce({ id: "r1", userId: "user-1", externalId: "1", ownerLogin: "o", isPrivate: false, defaultBranch: "main", primaryLanguage: null, lastSyncedAt: null, createdAt: new Date(), updatedAt: new Date() })
      .mockResolvedValueOnce({ id: "r2", userId: "user-1", externalId: "2", ownerLogin: "o", isPrivate: false, defaultBranch: "main", primaryLanguage: null, lastSyncedAt: null, createdAt: new Date(), updatedAt: new Date() });
    mockFetchCommits.mockResolvedValue([]);
    mockFetchPRs.mockResolvedValue([]);

    await processImportJob("job-1");

    expect(mockUpdateProgress).toHaveBeenCalledWith("job-1", 0, 2);
    expect(mockUpdateProgress).toHaveBeenCalledWith("job-1", 1, 2);
    expect(mockUpdateProgress).toHaveBeenCalledWith("job-1", 2, 2);
  });

  it("uses lastSyncedAt for checkpoint resume", async () => {
    const lastSync = new Date("2026-01-01T00:00:00Z");
    mockGetJob.mockResolvedValue(
      createMockJob({ status: "failed", errorDetails: { attempts: 1, lastError: "timeout" } }),
    );
    mockFetchRepos.mockResolvedValue([
      { externalId: "123", ownerLogin: "owner", isPrivate: false, defaultBranch: "main", primaryLanguage: null },
    ]);
    mockUpsertRepo.mockResolvedValue({
      id: "repo-1", userId: "user-1", externalId: "123", ownerLogin: "owner",
      isPrivate: false, defaultBranch: "main", primaryLanguage: null,
      lastSyncedAt: lastSync, createdAt: new Date(), updatedAt: new Date(),
    });
    mockFetchCommits.mockResolvedValue([]);
    mockFetchPRs.mockResolvedValue([]);

    await processImportJob("job-1");

    expect(mockFetchCommits).toHaveBeenCalledWith(
      expect.anything(), "owner", "123", expect.anything(), lastSync,
    );
    expect(mockFetchPRs).toHaveBeenCalledWith(
      expect.anything(), "owner", "123", expect.anything(), lastSync,
    );
  });
});
