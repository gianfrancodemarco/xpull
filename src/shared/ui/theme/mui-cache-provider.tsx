"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

export function MuiCacheProvider({ children }: { children: React.ReactNode }) {
  return <AppRouterCacheProvider>{children}</AppRouterCacheProvider>;
}
