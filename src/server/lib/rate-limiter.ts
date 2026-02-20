const DEFAULT_RATE_LIMIT = 5000;
const PAUSE_THRESHOLD = 0.8;

export class GitHubRateLimiter {
  private remaining = DEFAULT_RATE_LIMIT;
  private limit = DEFAULT_RATE_LIMIT;
  private resetAt = 0;

  shouldPause(): boolean {
    const consumed = this.limit - this.remaining;
    return consumed >= this.limit * PAUSE_THRESHOLD;
  }

  async waitForReset(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    if (this.resetAt <= now) return;

    const waitMs = (this.resetAt - now + 2) * 1000;
    await sleep(waitMs);
  }

  handleResponse(headers: Record<string, string | undefined>): void {
    const remaining = headers["x-ratelimit-remaining"];
    const limit = headers["x-ratelimit-limit"];
    const reset = headers["x-ratelimit-reset"];

    if (remaining !== undefined) this.remaining = parseInt(remaining, 10);
    if (limit !== undefined) this.limit = parseInt(limit, 10);
    if (reset !== undefined) this.resetAt = parseInt(reset, 10);
  }

  getState() {
    return {
      remaining: this.remaining,
      limit: this.limit,
      resetAt: this.resetAt,
    };
  }
}

export async function waitWithBackoff(
  attempt: number,
  baseMs = 1000,
  maxMs = 60000,
): Promise<void> {
  const exponential = baseMs * Math.pow(2, attempt);
  const capped = Math.min(exponential, maxMs);
  const jitter = capped * (0.5 + Math.random() * 0.5);
  await sleep(jitter);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
