import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/db", () => {
  return {
    db: {
      gitEvent: {
        create: vi.fn(),
        createMany: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        groupBy: vi.fn(),
        aggregate: vi.fn(),
      },
      repository: {
        count: vi.fn(),
      },
    },
  };
});

import {
  createGitEvent,
  createGitEvents,
  gitEventExists,
  getGitEventsByUserId,
  getGitEventStats,
} from "./gitEventRepository";
import { db } from "~/server/db";

const mockRepoCount = (db.repository as unknown as { count: ReturnType<typeof vi.fn> }).count;

const mock = db.gitEvent as unknown as {
  create: ReturnType<typeof vi.fn>;
  createMany: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  findMany: ReturnType<typeof vi.fn>;
  groupBy: ReturnType<typeof vi.fn>;
  aggregate: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

const baseEventData = {
  userId: "user-1",
  repositoryId: "repo-1",
  importJobId: "job-1",
  externalId: "ext-123",
  eventType: "commit" as const,
  occurredAt: new Date("2026-01-15T10:00:00Z"),
  linesAdded: 42,
  linesRemoved: 10,
  filesChanged: 3,
  languages: [{ language: "TypeScript", bytes: 1200 }],
  metadata: { sha: "abc123" },
};

describe("gitEventRepository", () => {
  describe("createGitEvent", () => {
    it("creates a single git event", async () => {
      mock.create.mockResolvedValueOnce({ id: "evt-1", ...baseEventData });

      const result = await createGitEvent(baseEventData);

      expect(mock.create).toHaveBeenCalledWith({ data: baseEventData });
      expect(result.id).toBe("evt-1");
    });
  });

  describe("createGitEvents", () => {
    it("batch-creates multiple git events", async () => {
      const events = [baseEventData, { ...baseEventData, externalId: "ext-456" }];
      mock.createMany.mockResolvedValueOnce({ count: 2 });

      const result = await createGitEvents(events);

      expect(mock.createMany).toHaveBeenCalledWith({ data: events });
      expect(result.count).toBe(2);
    });
  });

  describe("gitEventExists", () => {
    it("returns true when event exists", async () => {
      mock.findUnique.mockResolvedValueOnce({ id: "evt-1" });

      const result = await gitEventExists("user-1", "ext-123");

      expect(mock.findUnique).toHaveBeenCalledWith({
        where: {
          uq_git_events_user_id_external_id: {
            userId: "user-1",
            externalId: "ext-123",
          },
        },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it("returns false when event does not exist", async () => {
      mock.findUnique.mockResolvedValueOnce(null);

      const result = await gitEventExists("user-1", "ext-999");

      expect(result).toBe(false);
    });
  });

  describe("getGitEventsByUserId", () => {
    it("returns all events for user without filters", async () => {
      mock.findMany.mockResolvedValueOnce([{ id: "evt-1" }]);

      const result = await getGitEventsByUserId("user-1");

      expect(mock.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        orderBy: { occurredAt: "desc" },
      });
      expect(result).toHaveLength(1);
    });

    it("applies eventType filter", async () => {
      mock.findMany.mockResolvedValueOnce([]);

      await getGitEventsByUserId("user-1", { eventType: "pull_request" });

      expect(mock.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1", eventType: "pull_request" },
        orderBy: { occurredAt: "desc" },
      });
    });

    it("applies date range filters", async () => {
      const from = new Date("2026-01-01");
      const to = new Date("2026-01-31");
      mock.findMany.mockResolvedValueOnce([]);

      await getGitEventsByUserId("user-1", { from, to });

      expect(mock.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          occurredAt: { gte: from, lte: to },
        },
        orderBy: { occurredAt: "desc" },
      });
    });

    it("applies repositoryId filter", async () => {
      mock.findMany.mockResolvedValueOnce([]);

      await getGitEventsByUserId("user-1", { repositoryId: "repo-1" });

      expect(mock.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1", repositoryId: "repo-1" },
        orderBy: { occurredAt: "desc" },
      });
    });
  });

  describe("getGitEventStats", () => {
    it("returns aggregated stats with events of each type", async () => {
      mock.groupBy.mockResolvedValueOnce([
        { eventType: "commit", _count: { id: 10 } },
        { eventType: "pull_request", _count: { id: 5 } },
        { eventType: "review", _count: { id: 3 } },
      ]);
      mock.aggregate.mockResolvedValueOnce({
        _min: { occurredAt: new Date("2025-01-01") },
        _max: { occurredAt: new Date("2026-02-01") },
      });
      mock.findMany.mockResolvedValueOnce([
        { languages: [{ language: "TypeScript", bytes: 1200 }] },
        { languages: [{ language: "TypeScript", bytes: 800 }, { language: "Python", bytes: 400 }] },
        { languages: [{ language: "Python", bytes: 200 }] },
      ]);
      mockRepoCount.mockResolvedValueOnce(7);

      const result = await getGitEventStats("user-1");

      expect(result.totalRepositories).toBe(7);
      expect(result.totalCommits).toBe(10);
      expect(result.totalPullRequests).toBe(5);
      expect(result.totalReviews).toBe(3);
      expect(result.languages).toEqual([
        { language: "TypeScript", count: 2 },
        { language: "Python", count: 2 },
      ]);
      expect(result.earliestEventDate).toEqual(new Date("2025-01-01"));
      expect(result.latestEventDate).toEqual(new Date("2026-02-01"));
    });

    it("returns zeros for empty data", async () => {
      mock.groupBy.mockResolvedValueOnce([]);
      mock.aggregate.mockResolvedValueOnce({
        _min: { occurredAt: null },
        _max: { occurredAt: null },
      });
      mock.findMany.mockResolvedValueOnce([]);
      mockRepoCount.mockResolvedValueOnce(0);

      const result = await getGitEventStats("user-1");

      expect(result.totalRepositories).toBe(0);
      expect(result.totalCommits).toBe(0);
      expect(result.totalPullRequests).toBe(0);
      expect(result.totalReviews).toBe(0);
      expect(result.languages).toEqual([]);
      expect(result.earliestEventDate).toBeNull();
      expect(result.latestEventDate).toBeNull();
    });

    it("aggregates languages across multiple events and sorts by count descending", async () => {
      mock.groupBy.mockResolvedValueOnce([]);
      mock.aggregate.mockResolvedValueOnce({
        _min: { occurredAt: null },
        _max: { occurredAt: null },
      });
      mock.findMany.mockResolvedValueOnce([
        { languages: [{ language: "Go", bytes: 500 }] },
        { languages: [{ language: "Rust", bytes: 300 }, { language: "Go", bytes: 200 }] },
        { languages: [{ language: "Rust", bytes: 100 }, { language: "Go", bytes: 100 }] },
      ]);
      mockRepoCount.mockResolvedValueOnce(0);

      const result = await getGitEventStats("user-1");

      expect(result.languages).toEqual([
        { language: "Go", count: 3 },
        { language: "Rust", count: 2 },
      ]);
    });

    it("handles events with non-array languages gracefully", async () => {
      mock.groupBy.mockResolvedValueOnce([]);
      mock.aggregate.mockResolvedValueOnce({
        _min: { occurredAt: null },
        _max: { occurredAt: null },
      });
      mock.findMany.mockResolvedValueOnce([
        { languages: "invalid" },
        { languages: null },
        { languages: [{ language: "TypeScript", bytes: 100 }] },
      ]);
      mockRepoCount.mockResolvedValueOnce(0);

      const result = await getGitEventStats("user-1");

      expect(result.languages).toEqual([{ language: "TypeScript", count: 1 }]);
    });
  });

  describe("privacy compliance", () => {
    it("does not store repository names, file paths, or raw code in event data", async () => {
      mock.create.mockResolvedValueOnce({ id: "evt-1", ...baseEventData });

      await createGitEvent(baseEventData);

      const eventData = mock.create.mock.calls[0]![0].data;
      expect(eventData).not.toHaveProperty("repositoryName");
      expect(eventData).not.toHaveProperty("filePaths");
      expect(eventData).not.toHaveProperty("rawCode");
      expect(eventData).not.toHaveProperty("diff");
      expect(eventData).not.toHaveProperty("commentContent");
      expect(eventData).toHaveProperty("linesAdded");
      expect(eventData).toHaveProperty("linesRemoved");
      expect(eventData).toHaveProperty("filesChanged");
      expect(eventData).toHaveProperty("languages");
    });
  });
});
