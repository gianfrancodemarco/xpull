import type { AppError } from "./errors";
import { createRequestId } from "./correlation-id";

export type ResponseMeta = {
  requestId: string;
  timestamp: string;
};

export type SuccessResponse<T> = {
  data: T;
  meta: ResponseMeta;
};

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ResponseMeta;
};

const buildMeta = (): ResponseMeta => ({
  requestId: createRequestId(),
  timestamp: new Date().toISOString(),
});

export function successResponse<T>(data: T): SuccessResponse<T> {
  return {
    data,
    meta: buildMeta(),
  };
}

export function errorResponse(error: AppError): ErrorResponse {
  return {
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
    meta: buildMeta(),
  };
}
