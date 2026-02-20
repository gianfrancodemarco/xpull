import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError, AppErrorCode } from "~/shared/lib/errors";

vi.mock("~/server/db", () => ({
  db: {
    account: {
      findFirst: vi.fn(),
    },
  },
}));

import { getGitHubAccessToken } from "./github-token";
import { db } from "~/server/db";

const mockFindFirst = vi.mocked(db.account.findFirst);

describe("getGitHubAccessToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the access token when a GitHub account exists", async () => {
    mockFindFirst.mockResolvedValue({
      id: "acc1",
      userId: "user1",
      type: "oauth",
      provider: "github",
      providerAccountId: "12345",
      refresh_token: null,
      access_token: "ghp_valid_token",
      expires_at: null,
      token_type: "bearer",
      scope: "repo",
      id_token: null,
      session_state: null,
      refresh_token_expires_in: null,
    });

    const token = await getGitHubAccessToken("user1");

    expect(token).toBe("ghp_valid_token");
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { userId: "user1", provider: "github" },
      select: { access_token: true },
    });
  });

  it("throws AppError when no GitHub account found", async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(getGitHubAccessToken("user_no_github")).rejects.toThrow(
      AppError,
    );
    await expect(getGitHubAccessToken("user_no_github")).rejects.toMatchObject({
      code: AppErrorCode.Authentication,
    });
  });

  it("throws AppError when account exists but access_token is null", async () => {
    mockFindFirst.mockResolvedValue({
      id: "acc2",
      userId: "user2",
      type: "oauth",
      provider: "github",
      providerAccountId: "67890",
      refresh_token: null,
      access_token: null,
      expires_at: null,
      token_type: null,
      scope: null,
      id_token: null,
      session_state: null,
      refresh_token_expires_in: null,
    });

    await expect(getGitHubAccessToken("user2")).rejects.toThrow(AppError);
  });
});
