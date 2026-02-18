import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "~/server/auth/config";
import { getUserRepoPreferences, updateUserRepoPreference } from "~/server/data/repositories";

export async function GET() {
  const session = await getServerSession(authConfig as any);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const prefs = await getUserRepoPreferences(userId);
  return NextResponse.json({ data: prefs });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authConfig as any);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { repoName, allow } = body;
  if (!repoName || typeof allow !== "boolean") return NextResponse.json({ error: "invalid" }, { status: 400 });

  const userId = session.user.id as string;
  const prefs = await updateUserRepoPreference(userId, repoName, allow);
  return NextResponse.json({ data: prefs });
}
