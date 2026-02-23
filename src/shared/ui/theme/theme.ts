"use client";

import { createTheme } from "@mui/material/styles";

import { tokens } from "./tokens";

const { colors, typography, borderRadius, spacing } = tokens;

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.primary,
      contrastText: colors.background,
    },
    secondary: {
      main: colors.secondary,
      contrastText: colors.background,
    },
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.error,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    divider: "rgba(234, 240, 255, 0.08)",
  },
  typography: {
    fontFamily: typography.body,
    h1: { fontFamily: typography.heading, fontWeight: 700 },
    h2: { fontFamily: typography.heading, fontWeight: 700 },
    h3: { fontFamily: typography.heading, fontWeight: 600 },
    h4: { fontFamily: typography.heading, fontWeight: 600 },
    h5: { fontFamily: typography.heading, fontWeight: 600 },
    h6: { fontFamily: typography.heading, fontWeight: 600 },
    subtitle1: { fontFamily: typography.body, color: colors.textSecondary },
    subtitle2: { fontFamily: typography.body, color: colors.textSecondary },
    body1: { fontFamily: typography.body },
    body2: { fontFamily: typography.body },
    button: { fontFamily: typography.body, fontWeight: 600, textTransform: "none" as const },
    caption: { fontFamily: typography.body, color: colors.textSecondary },
    overline: {
      fontFamily: typography.code,
      letterSpacing: "0.15em",
      fontSize: "0.7rem",
      color: colors.textSecondary,
    },
    fontSize: 16,
  },
  spacing: spacing.sm,
  shape: {
    borderRadius: borderRadius.md,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          "--spacing-xs": `${spacing.xs}px`,
          "--spacing-sm": `${spacing.sm}px`,
          "--spacing-md": `${spacing.md}px`,
          "--spacing-lg": `${spacing.lg}px`,
          "--spacing-xl": `${spacing.xl}px`,
        },
        body: {
          backgroundColor: colors.background,
          color: colors.textPrimary,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background,
          backgroundImage: "none",
          borderBottom: `1px solid rgba(234, 240, 255, 0.06)`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          border: `1px solid rgba(234, 240, 255, 0.06)`,
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          textTransform: "none" as const,
          fontWeight: 600,
          minHeight: 44,
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#9370FF",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          fontFamily: typography.code,
          fontSize: "0.75rem",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        title: {
          fontFamily: typography.heading,
          fontWeight: 600,
        },
      },
    },
  },
});
