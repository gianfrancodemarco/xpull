import { db } from "~/server/db";

export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const jobCount = await db.importJob.count({
    where: { userId },
  });
  return jobCount > 0;
}
