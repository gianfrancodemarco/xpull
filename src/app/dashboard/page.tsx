import { getServerSession } from "next-auth";

import { authConfig } from "~/server/auth/config";
import DashboardView from "./dashboard-view";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  const userName = session?.user?.name ?? "xpull Citizen";

  return <DashboardView userName={userName} />;
}
