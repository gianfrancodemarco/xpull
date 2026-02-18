import Link from "next/link";
import type { CSSProperties } from "react";

import { tokens } from "~/shared/ui/theme/tokens";

import styles from "./index.module.css";

type ThemeVars = CSSProperties & {
  "--background"?: string;
  "--surface"?: string;
  "--surface-elevated"?: string;
  "--primary"?: string;
  "--secondary"?: string;
  "--accent"?: string;
  "--text-primary"?: string;
  "--text-secondary"?: string;
};

const stats = [
  { value: "12,800 XP", label: "historical progress captured" },
  { value: "24 nodes", label: "languages lighting skill tree branches" },
  { value: "+3 leagues", label: "levels unlocked during the Unboxing cascade" },
];

const highlights = [
  {
    title: "Cinematic Unboxing",
    detail: "A cascading reveal of levels, XP, and badges makes your history feel cinematic instead of static.",
  },
  {
    title: "Trust tied to GitHub data",
    detail: "Every stat references real commits, PRs, or reviews so you know this story is earned.",
  },
  {
    title: "Clear next action",
    detail: "Single CTA to connect GitHub plus a softer prompt to explore why your profile matters.",
  },
];

const trustNotes = [
  {
    title: "GitHub OAuth + Next-auth",
    detail: "JWT sessions start the instant you authorize the connection so the rest of the flow stays secure.",
  },
  {
    title: "Typed envelopes",
    detail: "Responses include the x-xpull-correlation-id meta header so we can trace every analysis job.",
  },
  {
    title: "Anti-pressure UX",
    detail: "WCAG-friendly layout, single primary CTA, and reassuring copy keep the landing page calm and confident.",
  },
];

const themeVars: ThemeVars = {
  "--background": tokens.colors.background,
  "--surface": tokens.colors.surface,
  "--surface-elevated": tokens.colors.surfaceElevated,
  "--primary": tokens.colors.primary,
  "--secondary": tokens.colors.secondary,
  "--accent": tokens.colors.accent,
  "--text-primary": tokens.colors.textPrimary,
  "--text-secondary": tokens.colors.textSecondary,
};

export default function Home() {
  return (
    <main className={styles.main} style={themeVars}>
      <section className={styles.heroPanel}>
        <div className={styles.heroText}>
          <p className={styles.heroBadge}>Neo Arcade / Landing</p>
          <h1 className={styles.heroTitle}>From invisible commits to living XP</h1>
          <p className={styles.heroDescription}>
            xpull turns your existing GitHub history into a cinematic Unboxing, level summary, and skill tree
            spotlight before you even log in. Every stat ties back to real activity so you can trust the story.
          </p>
          <div className={styles.ctaGroup}>
            <Link className={styles.primaryCta} href="/sign-in">
              Connect GitHub
            </Link>
            <Link className={styles.secondaryCta} href="#trust">
              See how it works
            </Link>
          </div>
          <ul className={styles.highlights}>
            {highlights.map((item) => (
              <li key={item.title} className={styles.highlightItem}>
                <span className={styles.highlightTitle}>{item.title}</span>
                <span className={styles.highlightDetail}>{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.heroLive}>
          <div className={styles.liveCard}>
            <p className={styles.liveLabel}>Live status</p>
            <p className={styles.liveValue}>Analysis ready</p>
            <p className={styles.liveNote}>
              Connect GitHub and we start the backstage analytics cascade that ends in your full profile.
            </p>
          </div>
          <div className={styles.liveCard}>
            <p className={styles.liveLabel}>Why it matters</p>
            <p className={styles.liveValue}>Visibility & trust</p>
            <p className={styles.liveNote}>
              The hero summary you see here will become your public profile, shareable in seconds.
            </p>
          </div>
        </div>
      </section>
      <section className={styles.statsGrid} aria-label="Progress at a glance">
        {stats.map((stat) => (
          <article key={stat.value} className={styles.statCard}>
            <p className={styles.statValue}>{stat.value}</p>
            <p className={styles.statLabel}>{stat.label}</p>
          </article>
        ))}
      </section>
      <section className={styles.trustSection} id="trust">
        {trustNotes.map((note) => (
          <article key={note.title} className={styles.trustCard}>
            <h2 className={styles.trustTitle}>{note.title}</h2>
            <p className={styles.trustDetail}>{note.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
