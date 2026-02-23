import type { GitEventType, Prisma } from "../../../../generated/prisma";
import { db } from "~/server/db";

type CreateGitEventData = {
  userId: string;
  repositoryId: string;
  importJobId?: string | null;
  externalId: string;
  eventType: GitEventType;
  occurredAt: Date;
  linesAdded: number;
  linesRemoved: number;
  filesChanged: number;
  languages: Prisma.InputJsonValue;
  metadata: Prisma.InputJsonValue;
};

export async function createGitEvent(data: CreateGitEventData) {
  return db.gitEvent.create({ data });
}

export async function createGitEvents(dataArray: CreateGitEventData[]) {
  return db.gitEvent.createMany({ data: dataArray, skipDuplicates: true });
}

export async function gitEventExists(userId: string, externalId: string) {
  const event = await db.gitEvent.findUnique({
    where: {
      uq_git_events_user_id_external_id: { userId, externalId },
    },
    select: { id: true },
  });
  return event !== null;
}

type GitEventFilters = {
  eventType?: GitEventType;
  repositoryId?: string;
  from?: Date;
  to?: Date;
};

export type GitEventStats = {
  totalRepositories: number;
  totalCommits: number;
  totalPullRequests: number;
  totalReviews: number;
  languages: { language: string; count: number }[];
  earliestEventDate: Date | null;
  latestEventDate: Date | null;
};

export async function getGitEventStats(
  userId: string,
): Promise<GitEventStats> {
  const [counts, dateRange, rawLanguages, repoCount] = await Promise.all([
    db.gitEvent.groupBy({
      by: ["eventType"],
      where: { userId },
      _count: { id: true },
    }),
    db.gitEvent.aggregate({
      where: { userId },
      _min: { occurredAt: true },
      _max: { occurredAt: true },
    }),
    db.gitEvent.findMany({
      where: { userId },
      select: { languages: true },
    }),
    db.repository.count({ where: { userId } }),
  ]);

  const countByType = Object.fromEntries(
    counts.map((c) => [c.eventType, c._count.id]),
  );

  const languageMap = new Map<string, number>();
  for (const row of rawLanguages) {
    const langs = row.languages as { language: string; bytes?: number }[];
    if (!Array.isArray(langs)) continue;
    for (const entry of langs) {
      if (entry.language) {
        languageMap.set(
          entry.language,
          (languageMap.get(entry.language) ?? 0) + 1,
        );
      }
    }
  }

  return {
    totalRepositories: repoCount,
    totalCommits: countByType["commit"] ?? 0,
    totalPullRequests: countByType["pull_request"] ?? 0,
    totalReviews: countByType["review"] ?? 0,
    languages: Array.from(languageMap.entries())
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count),
    earliestEventDate: dateRange._min.occurredAt,
    latestEventDate: dateRange._max.occurredAt,
  };
}

export async function getGitEventsByUserId(
  userId: string,
  filters?: GitEventFilters,
) {
  return db.gitEvent.findMany({
    where: {
      userId,
      ...(filters?.eventType && { eventType: filters.eventType }),
      ...(filters?.repositoryId && { repositoryId: filters.repositoryId }),
      ...((filters?.from ?? filters?.to) && {
        occurredAt: {
          ...(filters?.from && { gte: filters.from }),
          ...(filters?.to && { lte: filters.to }),
        },
      }),
    },
    orderBy: { occurredAt: "desc" },
  });
}
