import { createHmac } from "crypto";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/worker/jobs/webhook-sync.job", () => ({
  processWebhookEvent: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./route";
import { processWebhookEvent } from "~/worker/jobs/webhook-sync.job";

const mockProcess = processWebhookEvent as ReturnType<typeof vi.fn>;

const SECRET = "integration-test-secret";

function sign(payload: string, secret = SECRET): string {
  return `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

function buildRequest(
  body: string,
  options: {
    eventType?: string;
    deliveryId?: string;
    signature?: string;
    skipSignature?: boolean;
  } = {},
): Request {
  const headers: Record<string, string> = {
    "x-github-event": options.eventType ?? "push",
    "x-github-delivery": options.deliveryId ?? "delivery-int-1",
    "content-type": "application/json",
  };
  if (!options.skipSignature) {
    headers["x-hub-signature-256"] = options.signature ?? sign(body);
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

const pushPayload = JSON.stringify({
  sender: { id: 12345 },
  repository: {
    id: 100,
    owner: { login: "user" },
    private: false,
    default_branch: "main",
    language: "TypeScript",
  },
  commits: [
    {
      id: "sha1",
      timestamp: "2026-02-20T10:00:00Z",
      message: "initial",
      added: ["file.ts"],
      modified: [],
      removed: [],
    },
  ],
});

describe("Webhook Route Integration Tests", () => {
  it("accepts valid push event with correct signature and returns 200", async () => {
    const request = buildRequest(pushPayload, { eventType: "push" });
    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true });
  });

  it("rejects request with invalid signature and returns 401", async () => {
    const request = buildRequest(pushPayload, {
      signature: "sha256=badbadbadbad",
    });
    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("authentication_error");
    expect(body.error.message).toBe("Invalid webhook signature");
  });

  it("rejects request with signature from wrong secret", async () => {
    const wrongSig = sign(pushPayload, "wrong-secret");
    const request = buildRequest(pushPayload, { signature: wrongSig });
    const response = await POST(request as never);

    expect(response.status).toBe(401);
  });

  it("rejects request with missing signature header", async () => {
    const request = buildRequest(pushPayload, { skipSignature: true });
    const response = await POST(request as never);

    expect(response.status).toBe(401);
  });

  it("accepts pull_request event type", async () => {
    const prPayload = JSON.stringify({
      action: "opened",
      sender: { id: 1 },
      repository: {
        id: 100,
        owner: { login: "user" },
        private: false,
        default_branch: "main",
        language: null,
      },
      pull_request: {
        id: 200,
        title: "Test PR",
        updated_at: "2026-02-20T10:00:00Z",
        merged_at: null,
        additions: 10,
        deletions: 5,
        changed_files: 2,
      },
    });

    const request = buildRequest(prPayload, { eventType: "pull_request" });
    const response = await POST(request as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
  });

  it("accepts pull_request_review event type", async () => {
    const reviewPayload = JSON.stringify({
      action: "submitted",
      sender: { id: 1 },
      repository: {
        id: 100,
        owner: { login: "user" },
        private: false,
        default_branch: "main",
        language: null,
      },
      review: {
        id: 300,
        state: "approved",
        submitted_at: "2026-02-20T10:00:00Z",
      },
    });

    const request = buildRequest(reviewPayload, {
      eventType: "pull_request_review",
    });
    const response = await POST(request as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
  });

  it("returns ignored: true for unhandled event types", async () => {
    const payload = JSON.stringify({ action: "starred", sender: { id: 1 } });
    const request = buildRequest(payload, { eventType: "star" });
    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true, ignored: true });
    expect(mockProcess).not.toHaveBeenCalled();
  });

  it("returns 200 immediately (fire-and-forget processing)", async () => {
    let resolveProcess: (() => void) | undefined;
    mockProcess.mockImplementation(
      () => new Promise<void>((r) => (resolveProcess = r)),
    );

    const request = buildRequest(pushPayload, { eventType: "push" });
    const response = await POST(request as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });

    resolveProcess?.();
  });

  it("handles tampered payload (valid format but modified body)", async () => {
    const original = JSON.stringify({ sender: { id: 1 }, data: "original" });
    const tampered = JSON.stringify({ sender: { id: 1 }, data: "tampered" });
    const request = buildRequest(tampered, { signature: sign(original) });
    const response = await POST(request as never);

    expect(response.status).toBe(401);
  });
});
