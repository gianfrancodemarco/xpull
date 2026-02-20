import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/db", () => {
  return {
    db: {
      gitEvent: {
        create: vi.fn(),
        createMany: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
    },
  };
});

import {
  createGitEvent,
  createGitEvents,
  gitEventExists,
  getGitEventsByUserId,
} from "./gitEventRepository";
import { db } from "~/server/db";

const mock = db.gitEvent as unknown as {
  create: ReturnType<typeof vi.fn>;
  createMany: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  findMany: ReturnType<typeof vi.fn>;
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
