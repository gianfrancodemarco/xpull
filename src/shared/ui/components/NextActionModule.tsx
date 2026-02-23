"use client";

import React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import { tokens } from "~/shared/ui/theme/tokens";

type NextActionModuleProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
};

export function NextActionModule({ title, description, actionLabel, onAction }: NextActionModuleProps) {
  const isComingSoon = !onAction;

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, rgba(124, 77, 255, 0.1) 0%, rgba(0, 209, 255, 0.1) 100%)`,
        border: `1px solid rgba(124, 77, 255, 0.2)`,
      }}
    >
      <CardContent>
        <Typography
          variant="overline"
          sx={{ color: tokens.colors.secondary, mb: 0.5, display: "block" }}
        >
          Next Step
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontFamily: tokens.typography.heading, fontWeight: 600, mb: 0.5 }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
          disabled={isComingSoon}
          size="small"
        >
          {isComingSoon ? `${actionLabel} (Coming Soon)` : actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
