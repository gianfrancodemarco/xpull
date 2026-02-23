"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { StoryMilestoneCard } from "~/shared/ui/components/StoryMilestoneCard";
import { WhatChangedPanel } from "~/shared/ui/components/WhatChangedPanel";
import { NextActionModule } from "~/shared/ui/components/NextActionModule";
import { tokens } from "~/shared/ui/theme/tokens";

const PLACEHOLDER_MILESTONES = [
  {
    title: "Level Up!",
    description: "You crossed a major XP threshold — new abilities unlocked.",
    label: "milestone",
    variant: "placeholder" as const,
  },
  {
    title: "New Badge Unlocked",
    description: "Consistent contributions earned you the Streak Master badge.",
    label: "achievement",
    variant: "placeholder" as const,
  },
  {
    title: "Skill Branch Growing",
    description: "Your TypeScript branch extended with 12 new nodes this week.",
    label: "milestone",
    variant: "placeholder" as const,
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
          Your developer journey, one milestone at a time
        </Typography>
      </Box>

      <Stack spacing={3}>
        <WhatChangedPanel />

        {PLACEHOLDER_MILESTONES.map((card) => (
          <StoryMilestoneCard
            key={card.title}
            title={card.title}
            description={card.description}
            label={card.label}
            variant={card.variant}
          />
        ))}

        <NextActionModule
          title="Start your first import"
          description="Import your GitHub history to begin tracking your developer journey and earning XP."
          actionLabel="Go to Settings"
        />
      </Stack>
    </Box>
  );
}
