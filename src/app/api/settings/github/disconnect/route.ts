import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "~/server/auth/config";
import { db } from "~/server/db";

export async function POST() {
  const session = await getServerSession(authConfig as any);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;

  try {
    // Attempt to remove GitHub-related Account & Session rows via Prisma
    // If Prisma models exist, this will cascade as configured in schema
    if ((db as any).account) {
      // best-effort: delete all accounts for this user
      // Prisma client shape: db.account.deleteMany
      if ((db as any).account.deleteMany) {
        await (db as any).account.deleteMany({ where: { userId } });
      }
    }

    if ((db as any).session) {
      if ((db as any).session.deleteMany) {
        await (db as any).session.deleteMany({ where: { userId } });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("disconnect error", err);
    return NextResponse.json({ error: "disconnect_failed" }, { status: 500 });
  }
}
