import { getServerSession } from "next-auth/next";
import React from "react";

import TopAppBar from "~/shared/ui/nav/AppBar";
import { authConfig } from "~/server/auth/config";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authConfig as any);
  const user = session?.user ?? null;

  return (
    <div>
      <TopAppBar user={user} />
      <main style={{ paddingTop: 72 }}>{children}</main>
    </div>
  );
}
