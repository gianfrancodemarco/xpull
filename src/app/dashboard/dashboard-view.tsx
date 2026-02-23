"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { tokens } from "~/shared/ui/theme/tokens";
import { useAppDispatch, useAppSelector } from "~/shared/lib/store";
import { fetchImportStats } from "~/features/imports/importsSlice";
import { selectImportStats } from "~/features/imports/selectors";

type DashboardViewProps = {
  userName: string;
  userEmail?: string;
  userAvatar?: string;
};

export default function DashboardView({ userName, userEmail, userAvatar }: DashboardViewProps) {
  const dispatch = useAppDispatch();
  const importStats = useAppSelector(selectImportStats);

  useEffect(() => {
    void dispatch(fetchImportStats());
  }, [dispatch]);

  const hasData =
    importStats &&
    (importStats.totalCommits > 0 || importStats.totalPullRequests > 0 || importStats.totalReviews > 0);

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
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        p: { xs: 2, sm: 3 },
        maxWidth: 960,
        mx: "auto",
      }}
    >
      <Stack spacing={3}>
        {/* Identity Hero */}
        <Card
          sx={{
            border: `1px solid rgba(124, 77, 255, 0.3)`,
            background: `linear-gradient(135deg, ${tokens.colors.surface} 0%, rgba(124, 77, 255, 0.06) 100%)`,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar
                src={userAvatar}
                alt={`${userName} avatar`}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontFamily: tokens.typography.heading, fontWeight: 700 }}
                >
                  {userName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userEmail ?? "No email provided"}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label="Level — Coming Soon"
                size="small"
                sx={{
                  backgroundColor: "rgba(124, 77, 255, 0.15)",
                  color: tokens.colors.primary,
                }}
              />
              <Chip
                label="League — Coming Soon"
                size="small"
                variant="outlined"
                sx={{ borderColor: "rgba(234, 240, 255, 0.12)" }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* What Changed Panel */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{ fontFamily: tokens.typography.heading, mb: 1 }}
            >
              What Changed
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 2,
                color: "text.secondary",
              }}
            >
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                XP tracking coming in Epic 3
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Feed Preview — Milestone Card Placeholders */}
        <Box>
          <Typography
            variant="h6"
            sx={{ fontFamily: tokens.typography.heading, mb: 2 }}
          >
            Story Feed Preview
          </Typography>
          <Stack spacing={2}>
            {[
              {
                title: "Level Up!",
                description: "You crossed a major XP threshold — new abilities unlocked.",
                label: "milestone",
              },
              {
                title: "New Badge Unlocked",
                description: "Consistent contributions earned you the Streak Master badge.",
                label: "achievement",
              },
              {
                title: "Skill Branch Growing",
                description: "Your TypeScript branch extended with 12 new nodes this week.",
                label: "milestone",
              },
            ].map((card) => (
              <Card
                key={card.title}
                sx={{
                  border: `1px solid rgba(234, 240, 255, 0.06)`,
                  opacity: 0.7,
                }}
              >
                <CardContent>
                  <Chip
                    label={card.label}
                    size="small"
                    sx={{
                      mb: 1,
                      backgroundColor:
                        card.label === "achievement"
                          ? "rgba(255, 200, 87, 0.15)"
                          : "rgba(0, 209, 255, 0.15)",
                      color:
                        card.label === "achievement"
                          ? tokens.colors.accent
                          : tokens.colors.secondary,
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontFamily: tokens.typography.heading,
                      fontWeight: 600,
                      color: "text.primary",
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ mt: 1, display: "block", fontStyle: "italic" }}
                  >
                    Coming soon — placeholder
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>

        {/* Collected Data — real import stats */}
        <Box>
          <Typography
            variant="h6"
            sx={{ fontFamily: tokens.typography.heading, mb: 2 }}
          >
            Collected Data
          </Typography>
          {collectedInfo ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
            >
              {collectedInfo.map((info) => (
                <Card key={info.label} sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography
                      variant="overline"
                      sx={{ color: "text.secondary" }}
                    >
                      {info.label}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: tokens.typography.heading,
                        color: tokens.colors.success,
                        fontWeight: 700,
                      }}
                    >
                      {info.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {info.detail}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  No data yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Import your GitHub history to see your activity here.
                </Typography>
                <Button
                  component={Link}
                  href="/settings"
                  variant="contained"
                  color="primary"
                >
                  Go to Settings &amp; Import
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
