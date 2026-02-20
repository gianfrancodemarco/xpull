import { createHmac } from "crypto";
import { describe, it, expect } from "vitest";
import { verifyWebhookSignature } from "./webhook-verify";

const SECRET = "test-webhook-secret";

function sign(payload: string, secret = SECRET): string {
  return `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

describe("verifyWebhookSignature", () => {
  const payload = JSON.stringify({ action: "opened", repository: { id: 1 } });

  it("returns true for a valid signature", () => {
    const signature = sign(payload);
    expect(verifyWebhookSignature(payload, signature, SECRET)).toBe(true);
  });

  it("returns false for an invalid signature", () => {
    expect(
      verifyWebhookSignature(payload, "sha256=deadbeef0000", SECRET),
    ).toBe(false);
  });

  it("returns false for a missing signature", () => {
    expect(verifyWebhookSignature(payload, "", SECRET)).toBe(false);
  });

  it("returns false for a tampered payload", () => {
    const signature = sign(payload);
    const tampered = payload + "tampered";
    expect(verifyWebhookSignature(tampered, signature, SECRET)).toBe(false);
  });

  it("returns false when secret is empty", () => {
    const signature = sign(payload);
    expect(verifyWebhookSignature(payload, signature, "")).toBe(false);
  });

  it("returns false when signature has wrong secret", () => {
    const signature = sign(payload, "wrong-secret");
    expect(verifyWebhookSignature(payload, signature, SECRET)).toBe(false);
  });
});
