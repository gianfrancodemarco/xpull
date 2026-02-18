import React from "react";

import TopAppBar from "~/shared/ui/nav/AppBar";
import { auth } from "~/server/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? null;

  return (
    <div>
      <TopAppBar user={user} />
      <main style={{ paddingTop: 72 }}>{children}</main>
    </div>
  );
}
