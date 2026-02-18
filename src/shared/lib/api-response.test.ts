import { describe, expect, it } from "vitest";

import { AppError, AppErrorCode } from "./errors";
import { errorResponse, successResponse } from "./api-response";

describe("API response helpers", () => {
  it("wraps success payloads with data/meta", () => {
    const payload = { message: "ok" };
    const result = successResponse(payload);

    expect(result.data).toEqual(payload);
    expect(typeof result.meta.requestId).toBe("string");
    expect(typeof result.meta.timestamp).toBe("string");
  });

  it("converts AppError into structured error payload", () => {
    const appError = new AppError(AppErrorCode.Validation, "Invalid input", {
      invalidFields: ["email"],
    });

    const result = errorResponse(appError);

    expect(result.error.code).toBe("validation_error");
    expect(result.error.message).toBe("Invalid input");
    expect(result.error.details).toEqual({ invalidFields: ["email"] });
    expect(typeof result.meta.requestId).toBe("string");
  });
});
