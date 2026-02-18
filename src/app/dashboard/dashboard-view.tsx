"use client";

import Link from "next/link";

import styles from "./dashboard-view.module.css";
import { tokens } from "~/shared/ui/theme/tokens";

type DashboardViewProps = {
  userName: string;
};

const stats = [
  { label: "XP delta", value: "+420 XP", detail: "since last visit" },
  { label: "Next node", value: "Secure a Badge", detail: "5 actions to unlock" },
  { label: "New streak", value: "3 days", detail: "consistent contributions" },
];

const feedUpdates = [
  {
    label: "Story Feed",
    title: "What changed since yesterday",
    text: "Merge activity filled three more XP nodes, and the daily review card glows with a new Badge candidate.",
  },
  {
    label: "What changed",
    title: "XP delta + Leagues",
    text: "You crossed +420 XP, nudging the league bar closer to Bronze. Team badges stayed steady.",
  },
];

const nextActions = [
  {
    title: "Celebrate the Unboxing reveal",
    detail: "Share the new nodes, write a thank-you note to your inner guild.",
  },
  {
    title: "Inspect the Skill Galaxy",
    detail: "Open the skill tree, find the unlocked Python branch, and drop a follow-up commit.",
  },
];

const collectedInfo = [
  {
    label: "Collected info",
    value: "18,594 commits",
    detail: "Historical data imported from GitHub + relevant tags.",
  },
  {
    label: "Repos synced",
    value: "47 repos",
    detail: "Each repo keeps XP, league, and badge history in sync.",
  },
  {
    label: "Signals tracked",
    value: "12 badges",
    detail: "Badge progress recorded with correlation IDs for observability.",
  },
];

export default function DashboardView({ userName }: DashboardViewProps) {
  return (
    <main className={styles.main} style={{ color: tokens.colors.textPrimary }}>
      <section className={styles.hero}>
        <p className={styles.heroLabel}>Weekly Progress Check</p>
        <h1 className={styles.heroTitle}>Story Feed ready for {userName}</h1>
        <p className={styles.heroText}>
          The feed surfaces what changed, why it matters, and what to do next. Every pulse maps to real GitHub activity, so the
          journey stays credible and inspiring.
        </p>
        <div className={styles.heroMeta}>
          <div className={styles.heroMetaItem}>
            <strong>InVis</strong>
            <span>analysis in progress</span>
          </div>
          <div className={styles.heroMetaItem}>
            <strong>#023</strong>
            <span>Story feed cycle</span>
          </div>
        </div>
        <div className={styles.ctaRow}>
          <Link className={styles.ctaButton} href="/dashboard">
            Refresh feed
          </Link>
          <button className={styles.ctaOutline}>Share status</button>
        </div>
      </section>
      <section className={styles.statGrid}>
        {stats.map((stat) => (
          <article key={stat.label} className={styles.statCard}>
            <p className={styles.statValue}>{stat.value}</p>
            <p className={styles.statLabel}>
              {stat.label} · {stat.detail}
            </p>
          </article>
        ))}
      </section>
      <section className={styles.feed}>
        {feedUpdates.map((update) => (
          <article key={update.title} className={styles.feedCard}>
            <p className={styles.feedLabel}>{update.label}</p>
            <h2 className={styles.feedTitle}>{update.title}</h2>
            <p className={styles.feedText}>{update.text}</p>
          </article>
        ))}
      </section>
      <section className={styles.actions}>
        {nextActions.map((action) => (
          <article key={action.title} className={styles.actionCard}>
            <p className={styles.actionTitle}>{action.title}</p>
            <p className={styles.actionDetail}>{action.detail}</p>
          </article>
        ))}
      </section>
      <section className={styles.collected}>
        {collectedInfo.map((info) => (
          <article key={info.label} className={styles.collectedCard}>
            <p className={styles.collectedLabel}>{info.label}</p>
            <p className={styles.collectedValue}>{info.value}</p>
            <p className={styles.collectedDetail}>{info.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
