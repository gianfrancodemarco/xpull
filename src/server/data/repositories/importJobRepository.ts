import type { ImportJobStatus } from "../../../../generated/prisma";
import { db } from "~/server/db";

export async function createImportJob(
  userId: string,
  selectedRepoIds?: string[],
) {
  return db.importJob.create({
    data: {
      userId,
      ...(selectedRepoIds && { selectedRepoIds }),
    },
  });
}

export async function getImportJobById(id: string) {
  return db.importJob.findUnique({ where: { id } });
}

export async function getImportJobsByUserId(userId: string) {
  return db.importJob.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateImportJobStatus(
  id: string,
  status: ImportJobStatus,
  details?: { errorMessage?: string; errorDetails?: unknown },
) {
  const now = new Date();

  return db.importJob.update({
    where: { id },
    data: {
      status,
      ...(details?.errorMessage !== undefined && {
        errorMessage: details.errorMessage,
      }),
      ...(details?.errorDetails !== undefined && {
        errorDetails: details.errorDetails as Parameters<
          typeof db.importJob.update
        >[0]["data"]["errorDetails"],
      }),
      ...(status === "in_progress" && { startedAt: now }),
      ...(status === "completed" && { completedAt: now }),
      ...(status === "failed" && { completedAt: now }),
    },
  });
}

export async function updateImportJobProgress(
  id: string,
  processedItems: number,
  totalItems: number,
  currentRepository?: string,
) {
  const progress =
    totalItems > 0 ? Math.round((processedItems / totalItems) * 100) : 0;

  return db.importJob.update({
    where: { id },
    data: {
      processedItems,
      totalItems,
      progress,
      ...(currentRepository !== undefined && {
        errorDetails: { currentRepository } as Parameters<
          typeof db.importJob.update
        >[0]["data"]["errorDetails"],
      }),
    },
  });
}
