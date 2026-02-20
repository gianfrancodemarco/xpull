import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import {
  createImportJob,
  getImportJobsByUserId,
} from "~/server/data/repositories/importJobRepository";
import { successResponse, errorResponse } from "~/shared/lib/api-response";
import { AppError, AppErrorCode } from "~/shared/lib/errors";
import { createImportJobSchema } from "~/features/imports/schema";
import { processImportJob } from "~/worker/jobs/import-history.job";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      errorResponse(
        new AppError(AppErrorCode.Authentication, "Authentication required"),
      ),
      { status: 401 },
    );
  }

  try {
    const body = await request.json().catch(() => undefined);
    const parsed = createImportJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new AppError(
            AppErrorCode.Validation,
            "Invalid request body",
            parsed.error.issues,
          ),
        ),
        { status: 400 },
      );
    }
  } catch {
    // Body parsing is optional for this endpoint
  }

  const job = await createImportJob(session.user.id);

  void processImportJob(job.id).catch(console.error);

  return NextResponse.json(successResponse(job), { status: 201 });
}

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

  const jobs = await getImportJobsByUserId(session.user.id);

  return NextResponse.json(successResponse(jobs));
}
