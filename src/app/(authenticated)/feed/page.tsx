"use client";

import React from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { StoryMilestoneCard } from "~/shared/ui/components/StoryMilestoneCard";
import { WhatChangedPanel } from "~/shared/ui/components/WhatChangedPanel";
import { NextActionModule } from "~/shared/ui/components/NextActionModule";
import { tokens } from "~/shared/ui/theme/tokens";

const MOCK_FEED_ITEMS = [
  {
    title: "Reached Level 12!",
    description:
      "After a week of consistent contributions across 3 repos, Alice crossed the 4,800 XP threshold and unlocked the Architecture Lens ability.",
    label: "milestone",
    variant: "milestone" as const,
    timestamp: "2 hours ago",
    author: { name: "Alice Chen", avatar: undefined },
  },
  {
    title: "Streak Master Badge Earned",
    description:
      "Bob maintained a 30-day contribution streak — reviews, commits, and meaningful PR feedback every single day. That's dedication.",
    label: "achievement",
    variant: "achievement" as const,
    timestamp: "5 hours ago",
    author: { name: "Bob Martinez" },
  },
  {
    title: "TypeScript Branch Extended",
    description:
      "12 new skill nodes unlocked this week in the TypeScript branch. Carol is on track to reach the Advanced tier by next month.",
    label: "milestone",
    variant: "milestone" as const,
    timestamp: "Yesterday",
    author: { name: "Carol Park" },
  },
  {
    title: "First Code Review Pull",
    description:
      "Dan gave his first detailed code review that earned a Pull from a teammate — a social recognition for quality feedback.",
    label: "achievement",
    variant: "achievement" as const,
    timestamp: "Yesterday",
    author: { name: "Dan Okafor" },
  },
  {
    title: "New Repo Onboarded",
    description:
      "Eva imported her open-source project and instantly unlocked 2,100 XP from historical contributions. The skill tree is already branching.",
    label: "milestone",
    variant: "milestone" as const,
    timestamp: "2 days ago",
    author: { name: "Eva Lindström" },
  },
  {
    title: "League Promotion: Bronze → Silver",
    description:
      "Frank's consistent weekly XP gains pushed him into the Silver league. Top 20% of active developers this season.",
    label: "achievement",
    variant: "achievement" as const,
    timestamp: "3 days ago",
    author: { name: "Frank Russo" },
  },
];

export default function FeedPage() {
  return (
    <Box
      component="main"
      sx={{ p: { xs: 2, sm: 3 }, maxWidth: 720, mx: "auto" }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontFamily: tokens.typography.heading, fontWeight: 700 }}
        >
          Story Feed
        </Typography>
        <Typography variant="body1" color="text.secondary">
          See what your team has been achieving
        </Typography>
      </Box>

      <Stack spacing={3}>
        <WhatChangedPanel />

        <Divider sx={{ borderColor: "rgba(234, 240, 255, 0.06)" }} />

        <Typography
          variant="overline"
          sx={{ color: tokens.colors.textSecondary, letterSpacing: "0.15em" }}
        >
          Recent Activity
        </Typography>

        {MOCK_FEED_ITEMS.map((item) => (
          <StoryMilestoneCard
            key={`${item.author.name}-${item.title}`}
            title={item.title}
            description={item.description}
            label={item.label}
            variant={item.variant}
            timestamp={item.timestamp}
            author={item.author}
          />
        ))}

        <NextActionModule
          title="Import your history to join the feed"
          description="Once you import your GitHub data, your milestones and achievements will appear here for your team to see."
          actionLabel="Go to Settings"
        />
      </Stack>
    </Box>
  );
}
