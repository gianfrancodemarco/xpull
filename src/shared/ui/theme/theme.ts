"use client";

import { createTheme } from "@mui/material/styles";

import { tokens } from "./tokens";

const { colors, typography, borderRadius } = tokens;

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
  },
  typography: {
    fontFamily: typography.body,
    h1: {
      fontFamily: typography.heading,
    },
    h2: {
      fontFamily: typography.heading,
    },
    h3: {
      fontFamily: typography.heading,
    },
    fontSize: 16,
  },
  shape: {
    borderRadius: borderRadius.lg,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          "--spacing-xs": `${tokens.spacing.xs}px`,
          "--spacing-sm": `${tokens.spacing.sm}px`,
          "--spacing-md": `${tokens.spacing.md}px`,
          "--spacing-lg": `${tokens.spacing.lg}px`,
          "--spacing-xl": `${tokens.spacing.xl}px`,
        },
        body: {
          backgroundColor: colors.background,
          color: colors.textPrimary,
        },
      },
    },
  },
});
