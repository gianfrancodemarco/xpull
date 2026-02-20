import { createHmac } from "crypto";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/lib/webhook-verify", () => ({
  verifyWebhookSignature: vi.fn(),
}));

vi.mock("~/worker/jobs/webhook-sync.job", () => ({
  processWebhookEvent: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./route";
import { verifyWebhookSignature } from "~/server/lib/webhook-verify";
import { processWebhookEvent } from "~/worker/jobs/webhook-sync.job";

const mockVerify = verifyWebhookSignature as ReturnType<typeof vi.fn>;
const mockProcess = processWebhookEvent as ReturnType<typeof vi.fn>;

const SECRET = "test-secret";

function sign(payload: string): string {
  return `sha256=${createHmac("sha256", SECRET).update(payload).digest("hex")}`;
}

function buildRequest(
  body: string,
  eventType = "push",
  signature?: string,
): Request {
  const headers: Record<string, string> = {
    "x-github-event": eventType,
    "x-github-delivery": "delivery-123",
    "content-type": "application/json",
  };
  if (signature !== undefined) {
    headers["x-hub-signature-256"] = signature;
  }
  return new Request("http://localhost/api/webhooks/github", {
    method: "POST",
    headers,
    body,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("GITHUB_WEBHOOK_SECRET", SECRET);
});

describe("POST /api/webhooks/github", () => {
  const payload = JSON.stringify({ action: "push", sender: { id: 1 } });

  it("returns 401 when signature is invalid", async () => {
    mockVerify.mockReturnValue(false);

    const request = buildRequest(payload, "push", "sha256=invalid");
    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("authentication_error");
    expect(body.error.message).toBe("Invalid webhook signature");
  });

  it("returns 200 with ignored: true for unhandled event types", async () => {
    mockVerify.mockReturnValue(true);

    const request = buildRequest(payload, "issues", sign(payload));
    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true, ignored: true });
    expect(mockProcess).not.toHaveBeenCalled();
  });

  it("returns 200 and triggers processing for push events", async () => {
    mockVerify.mockReturnValue(true);

    const request = buildRequest(payload, "push", sign(payload));
    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true });
  });

  it("returns 200 and triggers processing for pull_request events", async () => {
    mockVerify.mockReturnValue(true);

    const request = buildRequest(payload, "pull_request", sign(payload));
    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true });
  });

  it("returns 200 and triggers processing for pull_request_review events", async () => {
    mockVerify.mockReturnValue(true);

    const request = buildRequest(
      payload,
      "pull_request_review",
      sign(payload),
    );
    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true });
  });

  it("returns 401 when signature header is missing", async () => {
    mockVerify.mockReturnValue(false);

    const request = buildRequest(payload, "push");
    const response = await POST(request as never);

    expect(response.status).toBe(401);
  });
});
