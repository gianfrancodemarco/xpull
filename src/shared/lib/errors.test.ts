import { describe, expect, it } from "vitest";

import { AppError, AppErrorCode } from "./errors";

describe("AppError", () => {
  it("stores code, message, and details", () => {
    const error = new AppError(AppErrorCode.NotFound, "Missing resource", {
      resource: "user",
    });

    expect(error.code).toBe(AppErrorCode.NotFound);
    expect(error.message).toBe("Missing resource");
    expect(error.details).toEqual({ resource: "user" });
  });
});
