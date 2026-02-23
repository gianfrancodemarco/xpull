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
        <p className={styles.badge}>GitHub OAuth</p>
        <h1 className={styles.title}>Sign in and start the Unboxing</h1>
        <p className={styles.description}>
          Authorize xpull to read your GitHub history. We immediately revoke the OAuth session when you disconnect and keep a typed
          response envelope with an <code>x-xpull-correlation-id</code> for every analysis job.
        </p>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Preparing analysis..." : "Sign in with GitHub"}
        </button>
        <p className={styles.status}>
          Once the OAuth handshake completes, the dashboard shows "analysis in progress" while we replay your commits, unlock levels,
          and highlight skill tree updates — all in plain language.
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
