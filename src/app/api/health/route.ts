"use server";

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

type Meta = {
  requestId: string;
  timestamp: string;
};

type HealthResponse = {
  data: {
    status: "ok";
    timestamp: string;
  };
  meta: Meta;
};

const createMeta = (): Meta => ({
  requestId: randomUUID(),
  timestamp: new Date().toISOString(),
});

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const payload: HealthResponse = {
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    meta: createMeta(),
  };

  return NextResponse.json(payload);
}
