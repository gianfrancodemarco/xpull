import { auth } from "~/server/auth";
import DashboardView from "./dashboard-view";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user ?? {};
  const userName = user.name ?? "xpull Citizen";
  return (
    <DashboardView
      userName={userName}
      userEmail={user.email ?? undefined}
      userAvatar={user.image ?? undefined}
    />
  );
}
