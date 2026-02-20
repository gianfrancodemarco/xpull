import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/lib/webhook-user-resolver", () => ({
  resolveWebhookUser: vi.fn(),
}));

vi.mock("~/server/data/repositories/gitEventRepository", () => ({
  gitEventExists: vi.fn(),
  createGitEvent: vi.fn(),
}));

vi.mock("~/server/data/repositories/repositoryRepository", () => ({
  upsertRepository: vi.fn(),
}));

vi.mock("~/server/lib/rate-limiter", () => ({
  waitWithBackoff: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("~/worker/services/webhook-normalizer", () => ({
  normalizePushEvent: vi.fn(),
  normalizePullRequestEvent: vi.fn(),
  normalizePullRequestReviewEvent: vi.fn(),
}));

import { processWebhookEvent } from "./webhook-sync.job";
import { resolveWebhookUser } from "~/server/lib/webhook-user-resolver";
import {
  gitEventExists,
  createGitEvent,
} from "~/server/data/repositories/gitEventRepository";
import { upsertRepository } from "~/server/data/repositories/repositoryRepository";
import { waitWithBackoff } from "~/server/lib/rate-limiter";
import {
  normalizePushEvent,
  normalizePullRequestEvent,
  normalizePullRequestReviewEvent,
} from "~/worker/services/webhook-normalizer";

const mockResolve = resolveWebhookUser as ReturnType<typeof vi.fn>;
const mockExists = gitEventExists as ReturnType<typeof vi.fn>;
const mockCreate = createGitEvent as ReturnType<typeof vi.fn>;
const mockUpsert = upsertRepository as ReturnType<typeof vi.fn>;
const mockBackoff = waitWithBackoff as ReturnType<typeof vi.fn>;
const mockNormPush = normalizePushEvent as ReturnType<typeof vi.fn>;
const mockNormPR = normalizePullRequestEvent as ReturnType<typeof vi.fn>;
const mockNormReview = normalizePullRequestReviewEvent as ReturnType<
  typeof vi.fn
>;

const repoMeta = {
  externalId: "123",
  ownerLogin: "octocat",
  isPrivate: false,
  defaultBranch: "main",
  primaryLanguage: "TypeScript",
};

const upsertedRepo = { id: "repo-db-1", ...repoMeta };

beforeEach(() => {
  vi.clearAllMocks();
  mockUpsert.mockResolvedValue(upsertedRepo);
  mockCreate.mockResolvedValue({ id: "event-1" });
});

describe("processWebhookEvent", () => {
  it("processes a push event end-to-end", async () => {
    mockResolve.mockResolvedValue({
      userId: "user-1",
      accessToken: "token",
    });
    mockExists.mockResolvedValue(false);
    mockNormPush.mockReturnValue({
      events: [
        {
          externalId: "abc123",
          eventType: "commit",
          occurredAt: new Date("2026-01-01"),
          linesAdded: 10,
          linesRemoved: 2,
          filesChanged: 3,
          languages: [{ language: "TypeScript", bytes: 2 }],
          metadata: { messageLength: 20 },
        },
      ],
      repoMeta,
    });

    await processWebhookEvent({
      eventType: "push",
      deliveryId: "d-1",
      payload: { sender: { id: 42 } },
    });

    expect(mockResolve).toHaveBeenCalledWith(42);
    expect(mockUpsert).toHaveBeenCalledWith("user-1", {
      externalId: "123",
      ownerLogin: "octocat",
      isPrivate: false,
      defaultBranch: "main",
      primaryLanguage: "TypeScript",
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        repositoryId: "repo-db-1",
        importJobId: null,
        externalId: "abc123",
        eventType: "commit",
      }),
    );
  });

  it("processes a pull_request event", async () => {
    mockResolve.mockResolvedValue({
      userId: "user-1",
      accessToken: "token",
    });
    mockExists.mockResolvedValue(false);
    mockNormPR.mockReturnValue({
      events: [
        {
          externalId: "pr-99",
          eventType: "pull_request",
          occurredAt: new Date("2026-01-01"),
          linesAdded: 50,
          linesRemoved: 10,
          filesChanged: 5,
          languages: [],
          metadata: { titleLength: 15, action: "opened" },
        },
      ],
      repoMeta,
    });

    await processWebhookEvent({
      eventType: "pull_request",
      deliveryId: "d-2",
      payload: { sender: { id: 42 } },
    });

    expect(mockNormPR).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        externalId: "pr-99",
        eventType: "pull_request",
      }),
    );
  });

  it("processes a pull_request_review event", async () => {
    mockResolve.mockResolvedValue({
      userId: "user-1",
      accessToken: "token",
    });
    mockExists.mockResolvedValue(false);
    mockNormReview.mockReturnValue({
      events: [
        {
          externalId: "rev-77",
          eventType: "review",
          occurredAt: new Date("2026-01-01"),
          linesAdded: 0,
          linesRemoved: 0,
          filesChanged: 0,
          languages: [],
          metadata: { reviewState: "approved" },
        },
      ],
      repoMeta,
    });

    await processWebhookEvent({
      eventType: "pull_request_review",
      deliveryId: "d-3",
      payload: { sender: { id: 42 } },
    });

    expect(mockNormReview).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        externalId: "rev-77",
        eventType: "review",
      }),
    );
  });

  it("skips duplicate events (deduplication)", async () => {
    mockResolve.mockResolvedValue({
      userId: "user-1",
      accessToken: "token",
    });
    mockExists.mockResolvedValue(true);
    mockNormPush.mockReturnValue({
      events: [
        {
          externalId: "already-exists",
          eventType: "commit",
          occurredAt: new Date("2026-01-01"),
          linesAdded: 0,
          linesRemoved: 0,
          filesChanged: 0,
          languages: [],
          metadata: { messageLength: 5 },
        },
      ],
      repoMeta,
    });

    await processWebhookEvent({
      eventType: "push",
      deliveryId: "d-dup",
      payload: { sender: { id: 42 } },
    });

    expect(mockExists).toHaveBeenCalledWith("user-1", "already-exists");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("silently returns when user is not registered", async () => {
    mockResolve.mockResolvedValue(null);

    await processWebhookEvent({
      eventType: "push",
      deliveryId: "d-unknown",
      payload: { sender: { id: 99999 } },
    });

    expect(mockResolve).toHaveBeenCalledWith(99999);
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("silently returns when sender is missing from payload", async () => {
    await processWebhookEvent({
      eventType: "push",
      deliveryId: "d-no-sender",
      payload: {},
    });

    expect(mockResolve).not.toHaveBeenCalled();
  });

  it("retries up to 3 times on failure with backoff", async () => {
    mockResolve
      .mockRejectedValueOnce(new Error("network error"))
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(null);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await processWebhookEvent({
      eventType: "push",
      deliveryId: "d-retry",
      payload: { sender: { id: 42 } },
    });

    expect(mockResolve).toHaveBeenCalledTimes(3);
    expect(mockBackoff).toHaveBeenCalledTimes(2);
    expect(mockBackoff).toHaveBeenCalledWith(0);
    expect(mockBackoff).toHaveBeenCalledWith(1);

    consoleSpy.mockRestore();
  });

  it("logs failure after exhausting retries", async () => {
    mockResolve.mockRejectedValue(new Error("persistent error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await processWebhookEvent({
      eventType: "push",
      deliveryId: "d-fail",
      payload: { sender: { id: 42 } },
    });

    expect(mockResolve).toHaveBeenCalledTimes(3);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed after 3 attempts"),
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("ignores unknown event types", async () => {
    mockResolve.mockResolvedValue({
      userId: "user-1",
      accessToken: "token",
    });

    await processWebhookEvent({
      eventType: "star",
      deliveryId: "d-star",
      payload: { sender: { id: 42 } },
    });

    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("processes push with multiple commits creating separate events", async () => {
    mockResolve.mockResolvedValue({
      userId: "user-1",
      accessToken: "token",
    });
    mockExists.mockResolvedValue(false);
    mockNormPush.mockReturnValue({
      events: [
        {
          externalId: "c1",
          eventType: "commit",
          occurredAt: new Date("2026-01-01"),
          linesAdded: 5,
          linesRemoved: 1,
          filesChanged: 2,
          languages: [],
          metadata: { messageLength: 10 },
        },
        {
          externalId: "c2",
          eventType: "commit",
          occurredAt: new Date("2026-01-01"),
          linesAdded: 3,
          linesRemoved: 0,
          filesChanged: 1,
          languages: [],
          metadata: { messageLength: 8 },
        },
      ],
      repoMeta,
    });

    await processWebhookEvent({
      eventType: "push",
      deliveryId: "d-multi",
      payload: { sender: { id: 42 } },
    });

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ externalId: "c1" }),
    );
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ externalId: "c2" }),
    );
  });

  it("stores only allowed metadata fields for privacy compliance", async () => {
    mockResolve.mockResolvedValue({
      userId: "user-1",
      accessToken: "token",
    });
    mockExists.mockResolvedValue(false);
    mockNormPush.mockReturnValue({
      events: [
        {
          externalId: "privacy-test",
          eventType: "commit",
          occurredAt: new Date("2026-01-01"),
          linesAdded: 0,
          linesRemoved: 0,
          filesChanged: 0,
          languages: [],
          metadata: { messageLength: 20 },
        },
      ],
      repoMeta,
    });

    await processWebhookEvent({
      eventType: "push",
      deliveryId: "d-privacy",
      payload: { sender: { id: 42 } },
    });

    const createCall = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
    const metadata = createCall.metadata as Record<string, unknown>;
    expect(metadata).toEqual({ messageLength: 20 });
    expect(metadata).not.toHaveProperty("repoName");
    expect(metadata).not.toHaveProperty("filePaths");
    expect(metadata).not.toHaveProperty("diff");
  });
});
