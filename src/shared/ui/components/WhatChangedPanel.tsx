"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { tokens } from "~/shared/ui/theme/tokens";

type WhatChangedPanelProps = {
  xpDelta?: number;
  levelChange?: number;
  unlockCount?: number;
};

export function WhatChangedPanel({ xpDelta, levelChange, unlockCount }: WhatChangedPanelProps) {
  const hasData = xpDelta !== undefined || levelChange !== undefined || unlockCount !== undefined;

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ fontFamily: tokens.typography.heading, mb: 2 }}
        >
          Since last visit
        </Typography>

        {hasData ? (
          <Stack direction="row" spacing={3}>
            {xpDelta !== undefined && (
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontFamily: tokens.typography.heading, fontWeight: 700, color: tokens.colors.success }}
                >
                  {xpDelta >= 0 ? "+" : ""}
                  {xpDelta} XP
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  XP delta
                </Typography>
              </Box>
            )}
            {levelChange !== undefined && (
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontFamily: tokens.typography.heading, fontWeight: 700, color: tokens.colors.primary }}
                >
                  {levelChange >= 0 ? "+" : ""}
                  {levelChange}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Level movement
                </Typography>
              </Box>
            )}
            {unlockCount !== undefined && (
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontFamily: tokens.typography.heading, fontWeight: 700, color: tokens.colors.accent }}
                >
                  {unlockCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Unlocks
                </Typography>
              </Box>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            XP tracking coming soon — check back after Epic 3
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
