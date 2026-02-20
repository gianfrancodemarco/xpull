import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyWebhookSignature } from "~/server/lib/webhook-verify";
import { errorResponse } from "~/shared/lib/api-response";
import { AppError, AppErrorCode } from "~/shared/lib/errors";
import { processWebhookEvent } from "~/worker/jobs/webhook-sync.job";

const HANDLED_EVENTS = new Set(["push", "pull_request", "pull_request_review"]);

export async function POST(request: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET ?? "";
  const body = await request.text();
  const signature = request.headers.get("x-hub-signature-256") ?? "";
  const eventType = request.headers.get("x-github-event") ?? "";
  const deliveryId = request.headers.get("x-github-delivery") ?? "";

  if (!verifyWebhookSignature(body, signature, secret)) {
    return NextResponse.json(
      errorResponse(
        new AppError(
          AppErrorCode.Authentication,
          "Invalid webhook signature",
        ),
      ),
      { status: 401 },
    );
  }

  if (!HANDLED_EVENTS.has(eventType)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const payload = JSON.parse(body) as Record<string, unknown>;

  void processWebhookEvent({ eventType, deliveryId, payload }).catch(
    console.error,
  );

  return NextResponse.json({ received: true });
}
