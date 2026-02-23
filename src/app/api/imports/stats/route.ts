import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { getGitEventStats } from "~/server/data/repositories/gitEventRepository";
import { successResponse, errorResponse } from "~/shared/lib/api-response";
import { AppError, AppErrorCode } from "~/shared/lib/errors";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      errorResponse(
        new AppError(AppErrorCode.Authentication, "Authentication required"),
      ),
      { status: 401 },
    );
  }

  const stats = await getGitEventStats(session.user.id);

  return NextResponse.json(
    successResponse({
      ...stats,
      earliestEventDate: stats.earliestEventDate?.toISOString() ?? null,
      latestEventDate: stats.latestEventDate?.toISOString() ?? null,
    }),
  );
}
