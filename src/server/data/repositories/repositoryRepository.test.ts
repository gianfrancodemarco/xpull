import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/db", () => {
  return {
    db: {
      repository: {
        upsert: vi.fn(),
        findMany: vi.fn(),
      },
    },
  };
});

import {
  upsertRepository,
  getRepositoriesByUserId,
} from "./repositoryRepository";
import { db } from "~/server/db";

const mock = db.repository as unknown as {
  upsert: ReturnType<typeof vi.fn>;
  findMany: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("repositoryRepository", () => {
  const userId = "user-1";

  describe("upsertRepository", () => {
    it("creates or updates a repository with unique constraint", async () => {
      const data = {
        externalId: "12345",
        ownerLogin: "testuser",
        isPrivate: false,
        defaultBranch: "main",
        primaryLanguage: "TypeScript",
      };
      const mockRepo = { id: "repo-1", userId, ...data };
      mock.upsert.mockResolvedValueOnce(mockRepo);

      const result = await upsertRepository(userId, data);

      expect(mock.upsert).toHaveBeenCalledWith({
        where: {
          uq_repositories_user_id_external_id: {
            userId,
            externalId: "12345",
          },
        },
        create: { userId, ...data },
        update: {
          ownerLogin: "testuser",
          isPrivate: false,
          defaultBranch: "main",
          primaryLanguage: "TypeScript",
        },
      });
      expect(result).toEqual(mockRepo);
    });
  });

  describe("getRepositoriesByUserId", () => {
    it("returns all repositories for a user", async () => {
      const mockRepos = [{ id: "repo-1", userId, externalId: "12345" }];
      mock.findMany.mockResolvedValueOnce(mockRepos);

      const result = await getRepositoriesByUserId(userId);

      expect(mock.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockRepos);
    });
  });
});
