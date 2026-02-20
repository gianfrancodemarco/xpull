import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { getImportJobById } from "~/server/data/repositories/importJobRepository";
import { successResponse, errorResponse } from "~/shared/lib/api-response";
import { AppError, AppErrorCode } from "~/shared/lib/errors";
import { processImportJob } from "~/worker/jobs/import-history.job";

const MAX_RETRY_ATTEMPTS = 3;

type ErrorDetails = {
  attempts: number;
  lastError: string;
};

export async function POST(
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

  if (job.status !== "failed") {
    return NextResponse.json(
      errorResponse(
        new AppError(
          AppErrorCode.Validation,
          "Only failed import jobs can be retried",
        ),
      ),
      { status: 400 },
    );
  }

  const details = (job.errorDetails as ErrorDetails | null) ?? {
    attempts: 0,
    lastError: "",
  };
  if (details.attempts >= MAX_RETRY_ATTEMPTS) {
    return NextResponse.json(
      errorResponse(
        new AppError(
          AppErrorCode.Validation,
          `Import job has exceeded maximum retry attempts (${MAX_RETRY_ATTEMPTS})`,
        ),
      ),
      { status: 400 },
    );
  }

  void processImportJob(job.id).catch(console.error);

  return NextResponse.json(
    successResponse({ id: job.id, status: "retrying" }),
    { status: 202 },
  );
}
