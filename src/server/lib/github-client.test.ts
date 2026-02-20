import { describe, it, expect, vi } from "vitest";

const { MockOctokit } = vi.hoisted(() => ({
  MockOctokit: vi.fn(),
}));

vi.mock("@octokit/rest", () => ({
  Octokit: MockOctokit,
}));

import { createGitHubClient } from "./github-client";

describe("createGitHubClient", () => {
  it("creates an Octokit instance with the provided access token", () => {
    const client = createGitHubClient("ghp_test_token_123");

    expect(MockOctokit).toHaveBeenCalledWith({ auth: "ghp_test_token_123" });
    expect(client).toBeInstanceOf(MockOctokit);
  });

  it("passes different tokens correctly", () => {
    const client = createGitHubClient("ghp_another_token");

    expect(MockOctokit).toHaveBeenCalledWith({ auth: "ghp_another_token" });
    expect(client).toBeInstanceOf(MockOctokit);
  });
});
