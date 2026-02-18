import { describe, it, expect, vi, beforeEach } from "vitest";

// Provide a mock factory that creates the mocked functions inside the factory
vi.mock("~/server/db", () => {
  const findMany = vi.fn();
  const upsert = vi.fn();
  return {
    db: {
      repoPreference: {
        findMany,
        upsert,
      },
    },
  };
});

import { getUserRepoPreferences, updateUserRepoPreference } from "~/server/data/repositories";
import { db } from "~/server/db";

const mockedRepo = (db as any).repoPreference;

beforeEach(() => {
  mockedRepo.findMany.mockReset();
  mockedRepo.upsert.mockReset();
});

describe("repository service (Prisma-backed)", () => {
  it("maps findMany rows to RepoPref shape", async () => {
    mockedRepo.findMany.mockResolvedValueOnce([
      { id: 1, repoName: "xpull-web", fullName: "g/xpull-web", allowed: true },
    ]);

    const out = await getUserRepoPreferences("user-1");
    expect(mockedRepo.findMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(out).toEqual([{ id: 1, name: "xpull-web", full_name: "g/xpull-web", allowed: true }]);
  });

  it("upserts preference and returns updated list", async () => {
    mockedRepo.upsert.mockResolvedValueOnce({ id: 2, repoName: "xpull-web", fullName: "g/xpull-web", allowed: false });
    mockedRepo.findMany.mockResolvedValueOnce([
      { id: 2, repoName: "xpull-web", fullName: "g/xpull-web", allowed: false },
    ]);

    const out = await updateUserRepoPreference("user-1", "xpull-web", false);
    expect(mockedRepo.upsert).toHaveBeenCalled();
    expect(mockedRepo.findMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(out[0].allowed).toBe(false);
  });
});
