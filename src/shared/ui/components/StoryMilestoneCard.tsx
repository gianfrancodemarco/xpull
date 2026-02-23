"use client";

import React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

import { tokens } from "~/shared/ui/theme/tokens";

type StoryMilestoneCardVariant = "milestone" | "achievement" | "placeholder";

type StoryMilestoneCardProps = {
  title: string;
  description: string;
  timestamp?: string;
  label: string;
  action?: { label: string; onClick: () => void };
  variant?: StoryMilestoneCardVariant;
};

const variantColors: Record<StoryMilestoneCardVariant, { bg: string; text: string }> = {
  milestone: { bg: "rgba(0, 209, 255, 0.15)", text: tokens.colors.secondary },
  achievement: { bg: "rgba(255, 200, 87, 0.15)", text: tokens.colors.accent },
  placeholder: { bg: "rgba(234, 240, 255, 0.08)", text: tokens.colors.textSecondary },
};

export function StoryMilestoneCard({
  title,
  description,
  timestamp,
  label,
  action,
  variant = "milestone",
}: StoryMilestoneCardProps) {
  const colors = variantColors[variant];

  return (
    <Card
      sx={{
        opacity: variant === "placeholder" ? 0.7 : 1,
      }}
    >
      <CardContent>
        <Chip
          label={label}
          size="small"
          sx={{ mb: 1, backgroundColor: colors.bg, color: colors.text }}
        />
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: tokens.typography.heading,
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        {timestamp && (
          <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
            {timestamp}
          </Typography>
        )}
        {action && (
          <Button
            size="small"
            variant="text"
            onClick={action.onClick}
            sx={{ mt: 1, p: 0, minWidth: "auto" }}
          >
            {action.label}
          </Button>
        )}
        {variant === "placeholder" && (
          <Typography
            variant="caption"
            sx={{ mt: 1, display: "block", fontStyle: "italic", color: "text.secondary" }}
          >
            Coming soon
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
