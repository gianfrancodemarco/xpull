import { db } from "~/server/db";
import { AppError, AppErrorCode } from "~/shared/lib/errors";

export async function getGitHubAccessToken(userId: string): Promise<string> {
  const account = await db.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true },
  });

  if (!account?.access_token) {
    throw new AppError(
      AppErrorCode.Authentication,
      "No GitHub access token found. Please connect your GitHub account.",
    );
  }

  return account.access_token;
}
