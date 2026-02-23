import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { getGitHubAccessToken } from "~/server/lib/github-token";
import { createGitHubClient } from "~/server/lib/github-client";
import { successResponse, errorResponse } from "~/shared/lib/api-response";
import { AppError, AppErrorCode } from "~/shared/lib/errors";
import type { RepoItem } from "~/features/onboarding/schema";

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

  try {
    const accessToken = await getGitHubAccessToken(session.user.id);
    const octokit = createGitHubClient(accessToken);

    const repos = await octokit.paginate(
      octokit.rest.repos.listForAuthenticatedUser,
      { per_page: 100, sort: "updated", direction: "desc" },
    );

    const mapped: RepoItem[] = repos.map((repo) => ({
      name: repo.name,
      fullName: repo.full_name,
      language: repo.language ?? null,
      stars: repo.stargazers_count ?? 0,
      isPrivate: repo.private,
      updatedAt: repo.updated_at ?? new Date().toISOString(),
    }));

    return NextResponse.json(successResponse(mapped));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error), { status: 401 });
    }
    return NextResponse.json(
      errorResponse(
        new AppError(AppErrorCode.Unknown, "Failed to fetch repositories"),
      ),
      { status: 500 },
    );
  }
}
