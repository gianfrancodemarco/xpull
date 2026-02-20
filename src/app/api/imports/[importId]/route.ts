import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { getImportJobById } from "~/server/data/repositories/importJobRepository";
import { successResponse, errorResponse } from "~/shared/lib/api-response";
import { AppError, AppErrorCode } from "~/shared/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ importId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      errorResponse(
        new AppError(AppErrorCode.Authentication, "Authentication required"),
      ),
      { status: 401 },
    );
  }

  const { importId } = await params;
  const job = await getImportJobById(importId);

  if (!job || job.userId !== session.user.id) {
    return NextResponse.json(
      errorResponse(
        new AppError(AppErrorCode.NotFound, "Import job not found"),
      ),
      { status: 404 },
    );
  }

  return NextResponse.json(successResponse(job));
}
