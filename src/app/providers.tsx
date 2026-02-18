"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { Provider as ReduxProvider } from "react-redux";

import { MuiCacheProvider } from "~/shared/ui/theme/mui-cache-provider";
import { theme } from "~/shared/ui/theme/theme";
import { store } from "~/shared/lib/store";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <MuiCacheProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </MuiCacheProvider>
    </ReduxProvider>
  );
}
