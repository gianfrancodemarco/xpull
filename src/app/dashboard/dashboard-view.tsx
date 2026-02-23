"use client";

import React, { useEffect } from "react";
import Link from "next/link";

import styles from "./dashboard-view.module.css";
import { tokens } from "~/shared/ui/theme/tokens";
import { useAppDispatch, useAppSelector } from "~/shared/lib/store";
import { fetchImportStats } from "~/features/imports/importsSlice";
import { selectImportStats } from "~/features/imports/selectors";

type DashboardViewProps = {
  userName: string;
  userEmail?: string;
  userAvatar?: string;
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

export default function DashboardView({ userName, userEmail, userAvatar }: DashboardViewProps) {
  const dispatch = useAppDispatch();
  const importStats = useAppSelector(selectImportStats);

  useEffect(() => {
    void dispatch(fetchImportStats());
  }, [dispatch]);

  const hasData = importStats && (importStats.totalCommits > 0 || importStats.totalPullRequests > 0 || importStats.totalReviews > 0);

  const topLanguage = importStats?.languages?.[0];

  const collectedInfo = hasData
    ? [
        {
          label: "Commits",
          value: importStats.totalCommits.toLocaleString(),
          detail: "Historical commits imported from GitHub.",
        },
        {
          label: "Pull Requests",
          value: importStats.totalPullRequests.toLocaleString(),
          detail: "Merged pull requests tracked across your repos.",
        },
        {
          label: "Reviews",
          value: importStats.totalReviews.toLocaleString(),
          detail: topLanguage
            ? `Top language: ${topLanguage.language} (${topLanguage.count.toLocaleString()} events).`
            : "Code reviews tracked for contribution insights.",
        },
      ]
    : null;

  return (
    <main className={styles.main} style={{ color: tokens.colors.textPrimary }}>
      <section className={styles.hero}>
        <p className={styles.heroLabel}>Weekly Progress Check</p>
        <div className={styles.heroUser}>
          {userAvatar ? (
            <img className={styles.heroAvatar} src={userAvatar} alt={`${userName} avatar`} />
          ) : null}
          <div className={styles.heroUserInfo}>
            <p className={styles.heroUserName}>{userName}</p>
            <p className={styles.heroUserEmail}>{userEmail ?? "No email provided"}</p>
          </div>
        </div>
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
        {collectedInfo ? (
          collectedInfo.map((info) => (
            <article key={info.label} className={styles.collectedCard}>
              <p className={styles.collectedLabel}>{info.label}</p>
              <p className={styles.collectedValue}>{info.value}</p>
              <p className={styles.collectedDetail}>{info.detail}</p>
            </article>
          ))
        ) : (
          <article className={styles.collectedCard}>
            <p className={styles.collectedLabel}>No data yet</p>
            <p className={styles.collectedDetail}>
              Import your GitHub history to see your activity here.
            </p>
            <Link className={styles.ctaButton} href="/settings">
              Go to Settings &amp; Import
            </Link>
          </article>
        )}
      </section>
    </main>
  );
}
