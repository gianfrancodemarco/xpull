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
  { value: "12,800 XP", label: "archived from every merged PR" },
  { value: "24 nodes", label: "active skill tree beacons" },
  { value: "+3 leagues", label: "secret thresholds unlocked during replay" },
];

const highlights = [
  {
    title: "Neon progress map",
    detail: "A bold grid of XP pulses, badge flares, and league glows that make even quiet weeks feel epic.",
  },
  {
    title: "GitHub truth",
    detail: "Every pulse matches a real commit, review, or badge so you trust the glow without wondering how it happened.",
  },
  {
    title: "One button to launch",
    detail: "Tap ‘Activate GitHub’ and we start the cascade that turns your history into a living identity.",
  },
];

const trustNotes = [
  {
    title: "Secure OAuth heartbeat",
    detail: "Next-auth guards the session. When you disconnect, the link, token, and audit traces vanish instantly.",
  },
  {
    title: "Correlation-first telemetry",
    detail: "Every folder returns `x-xpull-correlation-id` so operations can replay one request from end to end.",
  },
  {
    title: "Playful, pressure-free tone",
    detail: "No rush messages—just clear status updates and a single CTA so the experience feels confident, not frantic.",
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
          <p className={styles.heroBadge}>Progress map</p>
          <h1 className={styles.heroTitle}>Turn quiet work into your neon legend</h1>
          <p className={styles.heroDescription}>
            Every commit, review, and badge already tells a story. xpull rewinds that narrative, lights up the key wins, and
            hands you a glowing path to share, show off, and keep growing.
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
