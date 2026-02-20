import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/db", () => ({
  db: {
    account: {
      findFirst: vi.fn(),
    },
  },
}));

import { resolveWebhookUser } from "./webhook-user-resolver";
import { db } from "~/server/db";

const mockFindFirst = db.account.findFirst as unknown as ReturnType<
  typeof vi.fn
>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resolveWebhookUser", () => {
  it("returns userId and accessToken when account is found", async () => {
    mockFindFirst.mockResolvedValueOnce({
      userId: "user-abc",
      access_token: "gho_token123",
    });

    const result = await resolveWebhookUser(12345);

    expect(result).toEqual({
      userId: "user-abc",
      accessToken: "gho_token123",
    });
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        provider: "github",
        providerAccountId: "12345",
      },
      select: {
        userId: true,
        access_token: true,
      },
    });
  });

  it("returns null when no matching account is found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const result = await resolveWebhookUser(99999);

    expect(result).toBeNull();
  });

  it("returns null when account has no access token", async () => {
    mockFindFirst.mockResolvedValueOnce({
      userId: "user-abc",
      access_token: null,
    });

    const result = await resolveWebhookUser(12345);

    expect(result).toBeNull();
  });
});
