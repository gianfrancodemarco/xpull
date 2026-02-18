import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns a standard envelope with meta information", async () => {
    const response = await GET();
    const result = await response.json();

    expect(result.data.status).toBe("ok");
    expect(result.data.timestamp).toBeDefined();
    expect(result.meta.requestId).toBeDefined();
    expect(result.meta.timestamp).toBeDefined();
  });
});
