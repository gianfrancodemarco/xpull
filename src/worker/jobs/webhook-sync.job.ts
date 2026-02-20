import { resolveWebhookUser } from "~/server/lib/webhook-user-resolver";
import {
  normalizePushEvent,
  normalizePullRequestEvent,
  normalizePullRequestReviewEvent,
  type NormalizedWebhookEvent,
  type WebhookRepoMeta,
} from "~/worker/services/webhook-normalizer";
import {
  gitEventExists,
  createGitEvent,
} from "~/server/data/repositories/gitEventRepository";
import { upsertRepository } from "~/server/data/repositories/repositoryRepository";
import { waitWithBackoff } from "~/server/lib/rate-limiter";
import type { Prisma } from "../../../generated/prisma";

const MAX_RETRIES = 3;

type WebhookEventInput = {
  eventType: string;
  deliveryId: string;
  payload: Record<string, unknown>;
};

export async function processWebhookEvent({
  eventType,
  deliveryId,
  payload,
}: WebhookEventInput): Promise<void> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await processOnce({ eventType, deliveryId, payload });
      return;
    } catch (error) {
      if (attempt < MAX_RETRIES - 1) {
        await waitWithBackoff(attempt);
        continue;
      }
      console.error(
        `[webhook-sync] Failed after ${MAX_RETRIES} attempts for delivery ${deliveryId}:`,
        error,
      );
    }
  }
}

async function processOnce({
  eventType,
  payload,
}: Omit<WebhookEventInput, "deliveryId">): Promise<void> {
  const sender = payload.sender as { id: number } | undefined;
  if (!sender?.id) return;

  const user = await resolveWebhookUser(sender.id);
  if (!user) return;

  let events: NormalizedWebhookEvent[];
  let repoMeta: WebhookRepoMeta;

  switch (eventType) {
    case "push": {
      const result = normalizePushEvent(payload);
      events = result.events;
      repoMeta = result.repoMeta;
      break;
    }
    case "pull_request": {
      const result = normalizePullRequestEvent(payload);
      events = result.events;
      repoMeta = result.repoMeta;
      break;
    }
    case "pull_request_review": {
      const result = normalizePullRequestReviewEvent(payload);
      events = result.events;
      repoMeta = result.repoMeta;
      break;
    }
    default:
      return;
  }

  const repo = await upsertRepository(user.userId, {
    externalId: repoMeta.externalId,
    ownerLogin: repoMeta.ownerLogin,
    isPrivate: repoMeta.isPrivate,
    defaultBranch: repoMeta.defaultBranch,
    primaryLanguage: repoMeta.primaryLanguage,
  });

  for (const event of events) {
    const exists = await gitEventExists(user.userId, event.externalId);
    if (exists) continue;

    await createGitEvent({
      userId: user.userId,
      repositoryId: repo.id,
      importJobId: null,
      externalId: event.externalId,
      eventType: event.eventType,
      occurredAt: event.occurredAt,
      linesAdded: event.linesAdded,
      linesRemoved: event.linesRemoved,
      filesChanged: event.filesChanged,
      languages: event.languages as unknown as Prisma.InputJsonValue,
      metadata: event.metadata as unknown as Prisma.InputJsonValue,
    });
  }
}
