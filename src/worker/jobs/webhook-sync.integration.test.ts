import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/db", () => ({ db: {} }));
vi.mock("~/server/lib/webhook-user-resolver");
vi.mock("~/server/data/repositories/gitEventRepository");
vi.mock("~/server/data/repositories/repositoryRepository");
vi.mock("~/server/lib/rate-limiter", () => ({
  waitWithBackoff: vi.fn().mockResolvedValue(undefined),
}));

import { processWebhookEvent } from "./webhook-sync.job";
import { resolveWebhookUser } from "~/server/lib/webhook-user-resolver";
import {
  gitEventExists,
  createGitEvent,
} from "~/server/data/repositories/gitEventRepository";
import { upsertRepository } from "~/server/data/repositories/repositoryRepository";

const mockResolve = vi.mocked(resolveWebhookUser);
const mockExists = vi.mocked(gitEventExists);
const mockCreate = vi.mocked(createGitEvent);
const mockUpsert = vi.mocked(upsertRepository);

const makeRepo = (id = "repo-1") => ({
  id,
  userId: "user-1",
  externalId: "123456",
  ownerLogin: "octocat",
  isPrivate: false,
  defaultBranch: "main",
  primaryLanguage: "TypeScript",
  lastSyncedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

beforeEach(() => {
  vi.clearAllMocks();
  mockResolve.mockResolvedValue({ userId: "user-1", accessToken: "gho_tok" });
  mockUpsert.mockResolvedValue(makeRepo());
  mockExists.mockResolvedValue(false);
  mockCreate.mockResolvedValue({
    id: "evt-1",
    userId: "user-1",
    repositoryId: "repo-1",
    importJobId: null,
    externalId: "ext",
    eventType: "commit",
    occurredAt: new Date(),
    linesAdded: 0,
    linesRemoved: 0,
    filesChanged: 0,
    languages: [],
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  } as never);
});

const pushPayload = {
  sender: { id: 12345 },
  repository: {
    id: 123456,
    owner: { login: "octocat" },
    private: false,
    default_branch: "main",
    language: "TypeScript",
  },
  commits: [
    {
      id: "abc111",
      timestamp: "2026-02-20T10:00:00Z",
      message: "feat: add webhook handler",
      author: { name: "Octocat", email: "octo@cat.com" },
      added: ["src/webhook.ts"],
      modified: ["src/index.ts"],
      removed: [],
    },
    {
      id: "abc222",
      timestamp: "2026-02-20T10:01:00Z",
      message: "fix: typo",
      author: { name: "Octocat", email: "octo@cat.com" },
      added: [],
      modified: ["README.md"],
      removed: [],
    },
  ],
};

const prPayload = {
  action: "opened",
  sender: { id: 12345 },
  repository: {
    id: 123456,
    owner: { login: "octocat" },
    private: false,
    default_branch: "main",
    language: "TypeScript",
  },
  pull_request: {
    id: 99001,
    title: "Add webhook support",
    updated_at: "2026-02-20T12:00:00Z",
    merged_at: null,
    additions: 120,
    deletions: 30,
    changed_files: 8,
  },
};

const reviewPayload = {
  action: "submitted",
  sender: { id: 12345 },
  repository: {
    id: 123456,
    owner: { login: "octocat" },
    private: false,
    default_branch: "main",
    language: "TypeScript",
  },
  review: {
    id: 77001,
    state: "approved",
    submitted_at: "2026-02-20T15:00:00Z",
  },
};

describe("Webhook Sync Integration Tests", () => {
  it("push with multiple commits: creates separate git events for each commit", async () => {
    await processWebhookEvent({
      eventType: "push",
      deliveryId: "del-push-1",
      payload: pushPayload,
    });

    expect(mockResolve).toHaveBeenCalledWith(12345);
    expect(mockUpsert).toHaveBeenCalledWith("user-1", {
      externalId: "123456",
      ownerLogin: "octocat",
      isPrivate: false,
      defaultBranch: "main",
      primaryLanguage: "TypeScript",
    });
    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        externalId: "abc111",
        eventType: "commit",
        importJobId: null,
      }),
    );
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        externalId: "abc222",
        eventType: "commit",
      }),
    );
  });

  it("PR opened: creates a pull_request event", async () => {
    await processWebhookEvent({
      eventType: "pull_request",
      deliveryId: "del-pr-1",
      payload: prPayload,
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        externalId: "99001",
        eventType: "pull_request",
        linesAdded: 120,
        linesRemoved: 30,
        filesChanged: 8,
      }),
    );
  });

  it("PR merged: uses merged_at timestamp", async () => {
    const mergedPR = {
      ...prPayload,
      action: "closed",
      pull_request: {
        ...prPayload.pull_request,
        merged_at: "2026-02-20T14:30:00Z",
      },
    };

    await processWebhookEvent({
      eventType: "pull_request",
      deliveryId: "del-pr-merged",
      payload: mergedPR,
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        occurredAt: new Date("2026-02-20T14:30:00Z"),
      }),
    );
  });

  it("review submitted: creates a review event", async () => {
    await processWebhookEvent({
      eventType: "pull_request_review",
      deliveryId: "del-review-1",
      payload: reviewPayload,
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        externalId: "77001",
        eventType: "review",
        linesAdded: 0,
        linesRemoved: 0,
      }),
    );
  });

  it("duplicate delivery: skips events that already exist", async () => {
    mockExists.mockResolvedValue(true);

    await processWebhookEvent({
      eventType: "push",
      deliveryId: "del-dup-1",
      payload: pushPayload,
    });

    expect(mockExists).toHaveBeenCalledTimes(2);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("out-of-order: PR merge before PR create — repo upsert handles missing repo", async () => {
    const mergePayload = {
      ...prPayload,
      action: "closed",
      pull_request: {
        ...prPayload.pull_request,
        merged_at: "2026-02-20T14:00:00Z",
      },
    };

    await processWebhookEvent({
      eventType: "pull_request",
      deliveryId: "del-oo-merge",
      payload: mergePayload,
    });

    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();
    mockResolve.mockResolvedValue({ userId: "user-1", accessToken: "gho_tok" });
    mockUpsert.mockResolvedValue(makeRepo());
    mockExists.mockResolvedValue(false);
    mockCreate.mockResolvedValue({} as never);

    const openPayload = { ...prPayload, action: "opened" };
    await processWebhookEvent({
      eventType: "pull_request",
      deliveryId: "del-oo-open",
      payload: openPayload,
    });

    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("out-of-order: review before PR — review event created independently", async () => {
    await processWebhookEvent({
      eventType: "pull_request_review",
      deliveryId: "del-oo-review",
      payload: reviewPayload,
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "review" }),
    );
  });

  it("unknown user: silently skips when sender is not registered", async () => {
    mockResolve.mockResolvedValue(null);

    await processWebhookEvent({
      eventType: "push",
      deliveryId: "del-unknown",
      payload: { ...pushPayload, sender: { id: 99999 } },
    });

    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("privacy: no event metadata contains repository names, file paths, or raw content", async () => {
    await processWebhookEvent({
      eventType: "push",
      deliveryId: "del-priv-push",
      payload: pushPayload,
    });

    for (const call of mockCreate.mock.calls) {
      const data = call[0] as Record<string, unknown>;
      const meta = data.metadata as Record<string, unknown>;
      const metaStr = JSON.stringify(meta);

      expect(metaStr).not.toContain("octocat");
      expect(metaStr).not.toContain("src/webhook.ts");
      expect(metaStr).not.toContain("feat: add webhook handler");
      expect(metaStr).not.toContain("diff");

      const allowed = new Set(["messageLength", "titleLength", "reviewState", "action"]);
      for (const key of Object.keys(meta)) {
        expect(allowed.has(key)).toBe(true);
      }
    }
  });

  it("privacy: PR metadata only stores titleLength and action", async () => {
    await processWebhookEvent({
      eventType: "pull_request",
      deliveryId: "del-priv-pr",
      payload: prPayload,
    });

    const data = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
    const meta = data.metadata as Record<string, unknown>;
    expect(Object.keys(meta).sort()).toEqual(["action", "titleLength"]);
    expect(meta.titleLength).toBe(19);
    expect(meta.action).toBe("opened");
  });

  it("privacy: review metadata only stores reviewState", async () => {
    await processWebhookEvent({
      eventType: "pull_request_review",
      deliveryId: "del-priv-review",
      payload: reviewPayload,
    });

    const data = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
    const meta = data.metadata as Record<string, unknown>;
    expect(Object.keys(meta)).toEqual(["reviewState"]);
    expect(meta.reviewState).toBe("approved");
  });
});
