import { db } from "~/server/db";

type ResolvedUser = {
  userId: string;
  accessToken: string;
};

export async function resolveWebhookUser(
  senderGitHubId: number,
): Promise<ResolvedUser | null> {
  const account = await db.account.findFirst({
    where: {
      provider: "github",
      providerAccountId: String(senderGitHubId),
    },
    select: {
      userId: true,
      access_token: true,
    },
  });

  if (!account?.access_token) return null;

  return {
    userId: account.userId,
    accessToken: account.access_token,
  };
}
