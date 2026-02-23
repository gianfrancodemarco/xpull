import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/server/db", () => ({
  db: {
    importJob: {
      count: vi.fn(),
    },
  },
}));

import { hasCompletedOnboarding } from "./onboarding";
import { db } from "~/server/db";

const mockCount = db.importJob.count as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("hasCompletedOnboarding", () => {
  it("returns true when user has import jobs", async () => {
    mockCount.mockResolvedValueOnce(3);

    const result = await hasCompletedOnboarding("user-1");

    expect(result).toBe(true);
    expect(mockCount).toHaveBeenCalledWith({ where: { userId: "user-1" } });
  });

  it("returns false when user has no import jobs", async () => {
    mockCount.mockResolvedValueOnce(0);

    const result = await hasCompletedOnboarding("user-2");

    expect(result).toBe(false);
    expect(mockCount).toHaveBeenCalledWith({ where: { userId: "user-2" } });
  });
});
