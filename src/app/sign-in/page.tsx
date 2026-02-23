"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import type { CSSProperties } from "react";
import { useState, useCallback } from "react";

import { tokens } from "~/shared/ui/theme/tokens";

import styles from "./sign-in.module.css";

type ThemeVars = CSSProperties & {
  "--background"?: string;
  "--surface-elevated"?: string;
  "--primary"?: string;
  "--text-primary"?: string;
  "--text-secondary"?: string;
};

const themeVars: ThemeVars = {
  "--background": tokens.colors.background,
  "--surface-elevated": tokens.colors.surfaceElevated,
  "--primary": tokens.colors.primary,
  "--text-primary": tokens.colors.textPrimary,
  "--text-secondary": tokens.colors.textSecondary,
};

export default function SignInPage() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = useCallback(() => {
    if (loading) return;
    setLoading(true);
    void signIn("github", { callbackUrl: "/onboarding" });
  }, [loading]);

  return (
    <main className={styles.main} style={themeVars}>
      <section className={styles.card}>
        <p className={styles.badge}>Get started</p>
        <h1 className={styles.title}>Your code tells a story — let's light it up</h1>
        <p className={styles.description}>
          Connect your GitHub account and we'll turn every commit, review, and merged PR
          into a living map of your skills. It only takes a few seconds to get started.
        </p>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Connecting..." : "Continue with GitHub"}
        </button>
        <p className={styles.status}>
          We'll scan your contribution history, build your skill tree, and show you
          what you've been quietly mastering all along.
        </p>
        <div className={styles.footer}>
          <span className={styles.footerText}>Need to review the landing story again?</span>
          <Link className={styles.backLink} href="/">
            Return to landing
          </Link>
        </div>
      </section>
    </main>
  );
}
