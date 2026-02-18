import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import DashboardView from "./dashboard-view";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/sign-in");
    return null;
  }

  const user = session.user as { name?: string; email?: string; image?: string };
  const userName = user.name ?? "xpull Citizen";
  return (
    <DashboardView
      userName={userName}
      userEmail={user.email}
      userAvatar={user.image}
    />
  );
}
