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
  return db.gitEvent.createMany({ data: dataArray });
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
