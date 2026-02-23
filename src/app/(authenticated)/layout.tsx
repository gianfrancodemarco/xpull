import React from "react";
import Box from "@mui/material/Box";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import TopAppBar from "~/shared/ui/nav/AppBar";
import { auth } from "~/server/auth";
import { hasCompletedOnboarding } from "~/server/lib/onboarding";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? null;

  if (session?.user?.id) {
    const headersList = await headers();
    const pathname = headersList.get("x-onboarding-pathname") ?? "";
    const isOnboardingRoute = pathname === "true";

    if (!isOnboardingRoute) {
      const onboarded = await hasCompletedOnboarding(session.user.id);
      if (!onboarded) {
        redirect("/onboarding");
      }
    }
  }

  return (
    <div>
      <TopAppBar user={user} />
      <Box component="main" sx={{ pt: 1 }}>
        {children}
      </Box>
    </div>
  );
}
