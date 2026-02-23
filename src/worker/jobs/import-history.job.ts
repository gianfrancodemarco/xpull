import { createGitHubClient } from "~/server/lib/github-client";
import { getGitHubAccessToken } from "~/server/lib/github-token";
import { GitHubRateLimiter } from "~/server/lib/rate-limiter";
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
import {
  fetchUserRepositories,
  fetchRepositoryCommits,
  fetchRepositoryPullRequests,
  fetchPullRequestReviews,
} from "~/worker/services/github-fetcher";
import type { Prisma } from "../../../generated/prisma";

const BATCH_SIZE = 100;
const MAX_ATTEMPTS = 3;

type ErrorDetails = {
  attempts: number;
  lastError: string;
};

export async function processImportJob(jobId: string): Promise<void> {
  const job = await getImportJobById(jobId);
  if (!job) throw new Error(`Import job ${jobId} not found`);

  if (job.status !== "pending" && job.status !== "failed") {
    throw new Error(`Import job ${jobId} has status ${job.status}, expected pending or failed`);
  }

  const previousDetails = (job.errorDetails as ErrorDetails | null) ?? {
    attempts: 0,
    lastError: "",
  };
  if (previousDetails.attempts >= MAX_ATTEMPTS) {
    throw new Error(`Import job ${jobId} has exceeded maximum retry attempts (${MAX_ATTEMPTS})`);
  }

  const currentAttempt = previousDetails.attempts + 1;

  try {
    await updateImportJobStatus(jobId, "in_progress");

    const accessToken = await getGitHubAccessToken(job.userId);
    const octokit = createGitHubClient(accessToken);
    const rateLimiter = new GitHubRateLimiter();

    // Phase 1: Fetch and upsert repositories
    const repos = await fetchUserRepositories(octokit, rateLimiter);
    const totalRepos = repos.length;
    let processedRepos = 0;

    const repoRecords: Array<{ id: string; ownerLogin: string; name: string; externalId: string; lastSyncedAt: Date | null }> = [];
    for (const repo of repos) {
      const { name: _name, ...repoData } = repo;
      const record = await upsertRepository(job.userId, repoData);
      repoRecords.push({
        id: record.id,
        ownerLogin: repo.ownerLogin,
        name: repo.name,
        externalId: repo.externalId,
        lastSyncedAt: record.lastSyncedAt,
      });
    }

    await updateImportJobProgress(jobId, 0, totalRepos);

    for (const repo of repoRecords) {
      await updateImportJobProgress(jobId, processedRepos, totalRepos, `${repo.ownerLogin}/${repo.name}`);
      const sinceDate = repo.lastSyncedAt ?? undefined;

      // Fetch commits
      const commits = await fetchRepositoryCommits(
        octokit, repo.ownerLogin, repo.name, rateLimiter, sinceDate,
      );

      const commitEvents: Parameters<typeof createGitEvents>[0] = [];
      for (const commit of commits) {
        const exists = await gitEventExists(job.userId, commit.sha);
        if (exists) continue;

        commitEvents.push({
          userId: job.userId,
          repositoryId: repo.id,
          importJobId: jobId,
          externalId: commit.sha,
          eventType: "commit",
          occurredAt: commit.date,
          linesAdded: commit.linesAdded,
          linesRemoved: commit.linesRemoved,
          filesChanged: commit.filesChanged,
          languages: commit.languages as unknown as Prisma.InputJsonValue,
          metadata: { messageLength: commit.messageLength } as unknown as Prisma.InputJsonValue,
        });
      }

      // Batch insert commits
      for (let i = 0; i < commitEvents.length; i += BATCH_SIZE) {
        const batch = commitEvents.slice(i, i + BATCH_SIZE);
        await createGitEvents(batch);
      }

      // Fetch PRs
      const prs = await fetchRepositoryPullRequests(
        octokit, repo.ownerLogin, repo.name, rateLimiter, sinceDate,
      );

      const prEvents: Parameters<typeof createGitEvents>[0] = [];
      for (const pr of prs) {
        const exists = await gitEventExists(job.userId, pr.externalId);
        if (exists) continue;

        prEvents.push({
          userId: job.userId,
          repositoryId: repo.id,
          importJobId: jobId,
          externalId: pr.externalId,
          eventType: "pull_request",
          occurredAt: pr.mergedAt,
          linesAdded: pr.linesAdded,
          linesRemoved: pr.linesRemoved,
          filesChanged: pr.filesChanged,
          languages: [] as unknown as Prisma.InputJsonValue,
          metadata: { titleLength: pr.titleLength } as unknown as Prisma.InputJsonValue,
        });

        // Fetch reviews for this PR
        const reviews = await fetchPullRequestReviews(
          octokit, repo.ownerLogin, repo.name, pr.number, rateLimiter,
        );

        for (const review of reviews) {
          const reviewExists = await gitEventExists(job.userId, review.externalId);
          if (reviewExists) continue;

          prEvents.push({
            userId: job.userId,
            repositoryId: repo.id,
            importJobId: jobId,
            externalId: review.externalId,
            eventType: "review",
            occurredAt: review.submittedAt,
            linesAdded: 0,
            linesRemoved: 0,
            filesChanged: 0,
            languages: [] as unknown as Prisma.InputJsonValue,
            metadata: { reviewState: review.state } as unknown as Prisma.InputJsonValue,
          });
        }
      }

      // Batch insert PR and review events
      for (let i = 0; i < prEvents.length; i += BATCH_SIZE) {
        const batch = prEvents.slice(i, i + BATCH_SIZE);
        await createGitEvents(batch);
      }

      // Update repository sync timestamp
      await updateRepositoryLastSyncedAt(repo.id, new Date());

      processedRepos++;
      await updateImportJobProgress(jobId, processedRepos, totalRepos);
    }

    await updateImportJobStatus(jobId, "completed", { errorDetails: null });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await updateImportJobStatus(jobId, "failed", {
      errorMessage,
      errorDetails: {
        attempts: currentAttempt,
        lastError: errorMessage,
      },
    });
    throw error;
  }
}
