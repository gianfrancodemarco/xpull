import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GitHubRateLimiter, waitWithBackoff } from "./rate-limiter";

describe("GitHubRateLimiter", () => {
  let limiter: GitHubRateLimiter;

  beforeEach(() => {
    limiter = new GitHubRateLimiter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("shouldPause", () => {
    it("returns false when rate limit is fresh (no API calls made)", () => {
      expect(limiter.shouldPause()).toBe(false);
    });

    it("returns false when below 80% consumed", () => {
      limiter.handleResponse({
        "x-ratelimit-remaining": "2000",
        "x-ratelimit-limit": "5000",
        "x-ratelimit-reset": "9999999999",
      });

      expect(limiter.shouldPause()).toBe(false);
    });

    it("returns true when exactly 80% consumed", () => {
      limiter.handleResponse({
        "x-ratelimit-remaining": "1000",
        "x-ratelimit-limit": "5000",
        "x-ratelimit-reset": "9999999999",
      });

      expect(limiter.shouldPause()).toBe(true);
    });

    it("returns true when more than 80% consumed", () => {
      limiter.handleResponse({
        "x-ratelimit-remaining": "500",
        "x-ratelimit-limit": "5000",
        "x-ratelimit-reset": "9999999999",
      });

      expect(limiter.shouldPause()).toBe(true);
    });
  });

  describe("handleResponse", () => {
    it("updates internal state from response headers", () => {
      limiter.handleResponse({
        "x-ratelimit-remaining": "4500",
        "x-ratelimit-limit": "5000",
        "x-ratelimit-reset": "1700000000",
      });

      expect(limiter.getState()).toEqual({
        remaining: 4500,
        limit: 5000,
        resetAt: 1700000000,
      });
    });

    it("handles partial headers gracefully", () => {
      limiter.handleResponse({
        "x-ratelimit-remaining": "3000",
      });

      const state = limiter.getState();
      expect(state.remaining).toBe(3000);
      expect(state.limit).toBe(5000);
    });
  });

  describe("waitForReset", () => {
    it("resolves immediately when reset time is in the past", async () => {
      const pastReset = Math.floor(Date.now() / 1000) - 100;
      limiter.handleResponse({
        "x-ratelimit-remaining": "0",
        "x-ratelimit-limit": "5000",
        "x-ratelimit-reset": String(pastReset),
      });

      const promise = limiter.waitForReset();
      await promise;
    });

    it("waits until reset time when it is in the future", async () => {
      const futureReset = Math.floor(Date.now() / 1000) + 10;
      limiter.handleResponse({
        "x-ratelimit-remaining": "0",
        "x-ratelimit-limit": "5000",
        "x-ratelimit-reset": String(futureReset),
      });

      const promise = limiter.waitForReset();
      vi.advanceTimersByTime(12000);
      await promise;
    });
  });
});

describe("waitWithBackoff", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits with exponential backoff (attempt 0)", async () => {
    const promise = waitWithBackoff(0, 1000, 60000);
    vi.advanceTimersByTime(1000);
    await promise;
  });

  it("increases wait time with higher attempts", async () => {
    const promise = waitWithBackoff(3, 1000, 60000);
    vi.advanceTimersByTime(8000);
    await promise;
  });

  it("caps at maxMs", async () => {
    const promise = waitWithBackoff(20, 1000, 5000);
    vi.advanceTimersByTime(5000);
    await promise;
  });
});
