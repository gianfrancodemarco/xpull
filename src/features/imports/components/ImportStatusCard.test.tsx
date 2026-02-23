import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import importsReducer from "../importsSlice";
import { ImportStatusCard, ImportStatusCardSkeleton } from "./ImportStatusCard";
import type { ImportJobResponse } from "../schema";

function createMockStore() {
  return configureStore({
    reducer: { imports: importsReducer },
  });
}

function renderWithStore(ui: React.ReactElement) {
  return render(<Provider store={createMockStore()}>{ui}</Provider>);
}

const baseJob: ImportJobResponse = {
  id: "job-1",
  userId: "user-1",
  status: "completed",
  progress: 100,
  totalItems: 50,
  processedItems: 50,
  errorMessage: null,
  startedAt: "2026-01-15T10:00:00.000Z",
  completedAt: "2026-01-15T10:05:00.000Z",
  createdAt: "2026-01-15T09:59:00.000Z",
  updatedAt: "2026-01-15T10:05:00.000Z",
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ImportStatusCard", () => {
  it("renders completed status with chip", () => {
    renderWithStore(<ImportStatusCard job={baseJob} />);

    expect(screen.getByText("Import Status")).toBeInTheDocument();
    expect(screen.getByText("✅ Completed")).toBeInTheDocument();
    expect(screen.getByLabelText("Import status: Completed")).toBeInTheDocument();
  });

  it("renders pending status", () => {
    const pendingJob = { ...baseJob, status: "pending" as const, progress: 0, completedAt: null };
    renderWithStore(<ImportStatusCard job={pendingJob} />);

    expect(screen.getByText("⏳ Pending")).toBeInTheDocument();
    expect(screen.getByLabelText("Import status: Pending")).toBeInTheDocument();
  });

  it("renders in_progress status with progress bar", () => {
    const inProgressJob = {
      ...baseJob,
      status: "in_progress" as const,
      progress: 45,
      processedItems: 22,
      completedAt: null,
    };
    renderWithStore(<ImportStatusCard job={inProgressJob} />);

    expect(screen.getByText("🔄 In Progress")).toBeInTheDocument();
    expect(screen.getByLabelText("Import progress: 45%")).toBeInTheDocument();
    expect(screen.getByText("45% complete")).toBeInTheDocument();
  });

  it("renders failed status with error message and retry button", () => {
    const failedJob = {
      ...baseJob,
      status: "failed" as const,
      errorMessage: "Rate limit exceeded",
      completedAt: null,
    };
    renderWithStore(<ImportStatusCard job={failedJob} />);

    expect(screen.getByText("❌ Failed")).toBeInTheDocument();
    expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
    expect(screen.getByLabelText("Retry failed import")).toBeInTheDocument();
  });

  it("does not show retry button for non-failed jobs", () => {
    renderWithStore(<ImportStatusCard job={baseJob} />);

    expect(screen.queryByLabelText("Retry failed import")).not.toBeInTheDocument();
  });

  it("dispatches retryImportJob when retry button clicked", () => {
    const failedJob = {
      ...baseJob,
      status: "failed" as const,
      errorMessage: "Error",
      completedAt: null,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: "job-1", status: "retrying" } }),
      }),
    );

    renderWithStore(<ImportStatusCard job={failedJob} />);

    fireEvent.click(screen.getByLabelText("Retry failed import"));

    expect(fetch).toHaveBeenCalledWith("/api/imports/job-1/retry", { method: "POST" });
  });

  it("displays item counts", () => {
    renderWithStore(<ImportStatusCard job={baseJob} />);

    expect(screen.getByText("Items: 50 / 50 processed")).toBeInTheDocument();
  });

  it("displays item counts without total when null", () => {
    const noTotalJob = { ...baseJob, totalItems: null };
    renderWithStore(<ImportStatusCard job={noTotalJob} />);

    expect(screen.getByText("Items: 50 processed")).toBeInTheDocument();
  });

  it("has accessible status chip with aria-label", () => {
    renderWithStore(<ImportStatusCard job={baseJob} />);

    const chip = screen.getByLabelText("Import status: Completed");
    expect(chip).toBeInTheDocument();
  });

  it("does not render repository names or file paths", () => {
    renderWithStore(<ImportStatusCard job={baseJob} />);

    const html = document.body.innerHTML;
    expect(html).not.toContain("repositoryName");
    expect(html).not.toContain("filePath");
    expect(html).not.toContain("repoName");
  });
});

describe("ImportStatusCardSkeleton", () => {
  it("renders skeleton elements", () => {
    render(<ImportStatusCardSkeleton />);

    const skeletons = document.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
