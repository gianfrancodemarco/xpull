import { db } from "~/server/db";

type UpsertRepositoryData = {
  externalId: string;
  ownerLogin: string;
  isPrivate: boolean;
  defaultBranch?: string | null;
  primaryLanguage?: string | null;
};

export async function upsertRepository(
  userId: string,
  data: UpsertRepositoryData,
) {
  return db.repository.upsert({
    where: {
      uq_repositories_user_id_external_id: {
        userId,
        externalId: data.externalId,
      },
    },
    create: {
      userId,
      ...data,
    },
    update: {
      ownerLogin: data.ownerLogin,
      isPrivate: data.isPrivate,
      defaultBranch: data.defaultBranch,
      primaryLanguage: data.primaryLanguage,
    },
  });
}

export async function getRepositoriesByUserId(userId: string) {
  return db.repository.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateRepositoryLastSyncedAt(
  repositoryId: string,
  lastSyncedAt: Date,
) {
  return db.repository.update({
    where: { id: repositoryId },
    data: { lastSyncedAt },
  });
}
