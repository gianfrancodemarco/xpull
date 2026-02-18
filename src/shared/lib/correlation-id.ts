import { randomUUID } from "crypto";

export const correlationHeader = "x-xpull-correlation-id";

export function createRequestId() {
  return randomUUID();
}
