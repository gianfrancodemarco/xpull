"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

import { tokens } from "~/shared/ui/theme/tokens";
import { RepoSelectionStep } from "./RepoSelectionStep";
import { ImportKickoffStep } from "./ImportKickoffStep";
import { ImportStatusStep } from "./ImportStatusStep";

type WizardStep = "repoSelection" | "importKickoff" | "importStatus";

const STEP_LABELS = ["Select Repositories", "Start Import", "Import Progress"];

function stepIndex(step: WizardStep): number {
  const map: Record<WizardStep, number> = {
    repoSelection: 0,
    importKickoff: 1,
    importStatus: 2,
  };
  return map[step];
}

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("repoSelection");
  const [selectedRepoIds, setSelectedRepoIds] = useState<string[]>([]);
  const [importJobId, setImportJobId] = useState<string | null>(null);

  const handleReposSelected = (repoIds: string[]) => {
    setSelectedRepoIds(repoIds);
    setCurrentStep("importKickoff");
  };

  const handleImportStarted = (jobId: string) => {
    setImportJobId(jobId);
    setCurrentStep("importStatus");
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: 720,
        mx: "auto",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        pt: { xs: 4, sm: 6 },
      }}
    >
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontFamily: tokens.typography.heading, fontWeight: 700, mb: 1 }}
        >
          Let's set up your developer profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Import your GitHub activity to unlock your skill tree
        </Typography>
      </Box>

      <Stepper
        activeStep={stepIndex(currentStep)}
        alternativeLabel
        sx={{ width: "100%", mb: 4 }}
      >
        {STEP_LABELS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card sx={{ width: "100%" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {currentStep === "repoSelection" && (
            <RepoSelectionStep onContinue={handleReposSelected} />
          )}
          {currentStep === "importKickoff" && (
            <ImportKickoffStep
              selectedRepoIds={selectedRepoIds}
              onImportStarted={handleImportStarted}
            />
          )}
          {currentStep === "importStatus" && importJobId && (
            <ImportStatusStep importJobId={importJobId} />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
