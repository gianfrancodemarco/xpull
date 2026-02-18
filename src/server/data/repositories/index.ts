import { db } from "~/server/db";

type RepoPref = { id: number; name: string; full_name: string; allowed: boolean };

export async function getUserRepoPreferences(userId: string): Promise<RepoPref[]> {
  const rows = await (db as any).repoPreference.findMany({ where: { userId } });
  return rows.map((r: any) => ({ id: r.id, name: r.repoName, full_name: r.fullName, allowed: r.allowed }));
}

export async function updateUserRepoPreference(userId: string, repoName: string, allow: boolean): Promise<RepoPref[]> {
  // Use an upsert via the unique compound key (userId, repoName)
  const upserted = await (db as any).repoPreference.upsert({
    where: { userId_repoName: { userId, repoName } },
    create: { userId, repoName, fullName: repoName, allowed: allow },
    update: { allowed: allow },
  });

  const rows = await (db as any).repoPreference.findMany({ where: { userId } });
  return rows.map((r: any) => ({ id: r.id, name: r.repoName, full_name: r.fullName, allowed: r.allowed }));
}
