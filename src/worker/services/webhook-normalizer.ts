import { detectLanguages, type LanguageEntry } from "~/worker/services/github-fetcher";
import type { GitEventType } from "../../../generated/prisma";

export type WebhookRepoMeta = {
  externalId: string;
  ownerLogin: string;
  isPrivate: boolean;
  defaultBranch: string | null;
  primaryLanguage: string | null;
};

export type NormalizedWebhookEvent = {
  externalId: string;
  eventType: GitEventType;
  occurredAt: Date;
  linesAdded: number;
  linesRemoved: number;
  filesChanged: number;
  languages: LanguageEntry[];
  metadata: Record<string, unknown>;
};

type NormalizerResult = {
  events: NormalizedWebhookEvent[];
  repoMeta: WebhookRepoMeta;
};

function extractRepoMeta(payload: Record<string, unknown>): WebhookRepoMeta {
  const repository = payload.repository as Record<string, unknown>;
  const owner = repository.owner as Record<string, unknown>;
  return {
    externalId: String(repository.id),
    ownerLogin: String(owner.login),
    isPrivate: Boolean(repository.private),
    defaultBranch: (repository.default_branch as string) ?? null,
    primaryLanguage: (repository.language as string) ?? null,
  };
}

export function normalizePushEvent(
  payload: Record<string, unknown>,
): NormalizerResult {
  const repoMeta = extractRepoMeta(payload);
  const commits = (payload.commits ?? []) as Array<Record<string, unknown>>;

  const events: NormalizedWebhookEvent[] = commits.map((commit) => {
    const added = (commit.added ?? []) as string[];
    const modified = (commit.modified ?? []) as string[];
    const removed = (commit.removed ?? []) as string[];
    const files = [...added, ...modified].map((f) => ({ filename: f }));

    return {
      externalId: String(commit.id),
      eventType: "commit" as const,
      occurredAt: new Date(String(commit.timestamp)),
      linesAdded: 0,
      linesRemoved: 0,
      filesChanged: added.length + modified.length + removed.length,
      languages: detectLanguages(files),
      metadata: {
        messageLength: String(commit.message ?? "").length,
      },
    };
  });

  return { events, repoMeta };
}

export function normalizePullRequestEvent(
  payload: Record<string, unknown>,
): NormalizerResult {
  const repoMeta = extractRepoMeta(payload);
  const action = String(payload.action ?? "");
  const pr = payload.pull_request as Record<string, unknown>;

  const validActions = new Set(["opened", "closed", "synchronize"]);
  if (!validActions.has(action)) {
    return { events: [], repoMeta };
  }

  const occurredAt = pr.merged_at
    ? new Date(String(pr.merged_at))
    : new Date(String(pr.updated_at));

  const events: NormalizedWebhookEvent[] = [
    {
      externalId: String(pr.id),
      eventType: "pull_request" as const,
      occurredAt,
      linesAdded: Number(pr.additions ?? 0),
      linesRemoved: Number(pr.deletions ?? 0),
      filesChanged: Number(pr.changed_files ?? 0),
      languages: [],
      metadata: {
        titleLength: String(pr.title ?? "").length,
        action,
      },
    },
  ];

  return { events, repoMeta };
}

export function normalizePullRequestReviewEvent(
  payload: Record<string, unknown>,
): NormalizerResult {
  const repoMeta = extractRepoMeta(payload);
  const action = String(payload.action ?? "");
  const review = payload.review as Record<string, unknown>;

  if (action !== "submitted") {
    return { events: [], repoMeta };
  }

  const events: NormalizedWebhookEvent[] = [
    {
      externalId: String(review.id),
      eventType: "review" as const,
      occurredAt: new Date(String(review.submitted_at)),
      linesAdded: 0,
      linesRemoved: 0,
      filesChanged: 0,
      languages: [],
      metadata: {
        reviewState: String(review.state),
      },
    },
  ];

  return { events, repoMeta };
}
