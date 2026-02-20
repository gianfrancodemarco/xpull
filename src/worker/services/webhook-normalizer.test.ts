import { describe, it, expect } from "vitest";
import {
  normalizePushEvent,
  normalizePullRequestEvent,
  normalizePullRequestReviewEvent,
} from "./webhook-normalizer";

const baseRepo = {
  id: 123456,
  owner: { login: "octocat" },
  private: false,
  default_branch: "main",
  language: "TypeScript",
};

describe("normalizePushEvent", () => {
  it("normalizes a push with multiple commits", () => {
    const payload = {
      repository: baseRepo,
      commits: [
        {
          id: "abc123",
          timestamp: "2026-02-20T10:00:00Z",
          message: "feat: add new feature",
          author: { name: "Test", email: "test@test.com" },
          added: ["src/index.ts", "src/utils.ts"],
          modified: ["package.json"],
          removed: ["old-file.js"],
        },
        {
          id: "def456",
          timestamp: "2026-02-20T10:01:00Z",
          message: "fix: typo",
          author: { name: "Test", email: "test@test.com" },
          added: [],
          modified: ["README.md"],
          removed: [],
        },
      ],
    };

    const result = normalizePushEvent(payload);

    expect(result.repoMeta).toEqual({
      externalId: "123456",
      ownerLogin: "octocat",
      isPrivate: false,
      defaultBranch: "main",
      primaryLanguage: "TypeScript",
    });

    expect(result.events).toHaveLength(2);

    const first = result.events[0]!;
    expect(first.externalId).toBe("abc123");
    expect(first.eventType).toBe("commit");
    expect(first.occurredAt).toEqual(new Date("2026-02-20T10:00:00Z"));
    expect(first.filesChanged).toBe(4);
    expect(first.languages).toEqual(
      expect.arrayContaining([
        { language: "TypeScript", bytes: 2 },
        { language: "JSON", bytes: 1 },
      ]),
    );
    expect(first.metadata).toEqual({ messageLength: 21 });

    const second = result.events[1]!;
    expect(second.externalId).toBe("def456");
    expect(second.filesChanged).toBe(1);
    expect(second.metadata).toEqual({ messageLength: 9 });
  });

  it("handles a push with no commits", () => {
    const payload = { repository: baseRepo, commits: [] };
    const result = normalizePushEvent(payload);
    expect(result.events).toHaveLength(0);
  });

  it("detects languages from added and modified files", () => {
    const payload = {
      repository: baseRepo,
      commits: [
        {
          id: "lang-test",
          timestamp: "2026-02-20T10:00:00Z",
          message: "multi-lang",
          added: ["src/app.py", "src/util.go"],
          modified: ["src/main.rs"],
          removed: [],
        },
      ],
    };

    const result = normalizePushEvent(payload);
    const langs = result.events[0]!.languages;
    expect(langs).toEqual(
      expect.arrayContaining([
        { language: "Python", bytes: 1 },
        { language: "Go", bytes: 1 },
        { language: "Rust", bytes: 1 },
      ]),
    );
  });
});

describe("normalizePullRequestEvent", () => {
  const basePR = {
    id: 99001,
    title: "Add feature X",
    updated_at: "2026-02-20T12:00:00Z",
    merged_at: null,
    additions: 50,
    deletions: 10,
    changed_files: 3,
  };

  it("normalizes an opened PR event", () => {
    const payload = {
      action: "opened",
      repository: baseRepo,
      pull_request: basePR,
    };

    const result = normalizePullRequestEvent(payload);
    expect(result.events).toHaveLength(1);

    const event = result.events[0]!;
    expect(event.externalId).toBe("99001");
    expect(event.eventType).toBe("pull_request");
    expect(event.linesAdded).toBe(50);
    expect(event.linesRemoved).toBe(10);
    expect(event.filesChanged).toBe(3);
    expect(event.metadata).toEqual({
      titleLength: 13,
      action: "opened",
    });
  });

  it("normalizes a merged PR using merged_at timestamp", () => {
    const payload = {
      action: "closed",
      repository: baseRepo,
      pull_request: { ...basePR, merged_at: "2026-02-20T14:00:00Z" },
    };

    const result = normalizePullRequestEvent(payload);
    const event = result.events[0]!;
    expect(event.occurredAt).toEqual(new Date("2026-02-20T14:00:00Z"));
    expect(event.metadata).toEqual({ titleLength: 13, action: "closed" });
  });

  it("normalizes a synchronize event", () => {
    const payload = {
      action: "synchronize",
      repository: baseRepo,
      pull_request: basePR,
    };

    const result = normalizePullRequestEvent(payload);
    expect(result.events).toHaveLength(1);
  });

  it("ignores non-handled PR actions", () => {
    const payload = {
      action: "labeled",
      repository: baseRepo,
      pull_request: basePR,
    };

    const result = normalizePullRequestEvent(payload);
    expect(result.events).toHaveLength(0);
  });

  it("does not include raw content in metadata", () => {
    const payload = {
      action: "opened",
      repository: baseRepo,
      pull_request: basePR,
    };

    const result = normalizePullRequestEvent(payload);
    const meta = result.events[0]!.metadata;
    const keys = Object.keys(meta);
    expect(keys).toEqual(expect.arrayContaining(["titleLength", "action"]));
    expect(keys).not.toContain("title");
    expect(keys).not.toContain("body");
  });
});

describe("normalizePullRequestReviewEvent", () => {
  const baseReview = {
    id: 77001,
    state: "approved",
    submitted_at: "2026-02-20T15:00:00Z",
  };

  it("normalizes a submitted review", () => {
    const payload = {
      action: "submitted",
      repository: baseRepo,
      review: baseReview,
    };

    const result = normalizePullRequestReviewEvent(payload);
    expect(result.events).toHaveLength(1);

    const event = result.events[0]!;
    expect(event.externalId).toBe("77001");
    expect(event.eventType).toBe("review");
    expect(event.occurredAt).toEqual(new Date("2026-02-20T15:00:00Z"));
    expect(event.linesAdded).toBe(0);
    expect(event.linesRemoved).toBe(0);
    expect(event.metadata).toEqual({ reviewState: "approved" });
  });

  it("ignores non-submitted review actions", () => {
    const payload = {
      action: "dismissed",
      repository: baseRepo,
      review: baseReview,
    };

    const result = normalizePullRequestReviewEvent(payload);
    expect(result.events).toHaveLength(0);
  });

  it("does not include raw content in metadata", () => {
    const payload = {
      action: "submitted",
      repository: baseRepo,
      review: { ...baseReview, body: "LGTM!" },
    };

    const result = normalizePullRequestReviewEvent(payload);
    const meta = result.events[0]!.metadata;
    expect(Object.keys(meta)).toEqual(["reviewState"]);
    expect(meta).not.toHaveProperty("body");
  });
});
