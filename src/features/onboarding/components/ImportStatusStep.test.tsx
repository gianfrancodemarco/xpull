import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import importsReducer from "~/features/imports/importsSlice";
import type { ImportsState } from "~/features/imports/importsSlice";
import { ImportStatusStep } from "./ImportStatusStep";
import type { ImportJobResponse, ImportStatsResponse } from "~/features/imports/schema";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const baseJob: ImportJobResponse = {
  id: "job-1",
  userId: "user-1",
  status: "in_progress",
  progress: 50,
  totalItems: 10,
  processedItems: 5,
  errorMessage: null,
  startedAt: "2026-02-20T10:00:00.000Z",
  completedAt: null,
  createdAt: "2026-02-20T09:59:00.000Z",
  updatedAt: "2026-02-20T10:02:00.000Z",
};

const completedJob: ImportJobResponse = {
  ...baseJob,
  status: "completed",
  progress: 100,
  processedItems: 10,
  completedAt: "2026-02-20T10:05:00.000Z",
};

const mockStats: ImportStatsResponse = {
  totalCommits: 150,
  totalPullRequests: 20,
  totalReviews: 10,
  languages: [{ language: "TypeScript", count: 100 }],
  earliestEventDate: "2025-01-01T00:00:00.000Z",
  latestEventDate: "2026-02-20T00:00:00.000Z",
};

function createStore(overrides: Partial<ImportsState> = {}) {
  return configureStore({
    reducer: { imports: importsReducer },
    preloadedState: {
      imports: {
        jobs: [],
        stats: null,
        isLoading: false,
        isPolling: false,
        isStarting: false,
        error: null,
        ...overrides,
      },
    },
  });
}

function renderWithStore(ui: React.ReactElement, overrides: Partial<ImportsState> = {}) {
  return render(<Provider store={createStore(overrides)}>{ui}</Provider>);
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
  }));
});

describe("ImportStatusStep", () => {
  it("shows skeleton when job is not yet loaded", () => {
    renderWithStore(<ImportStatusStep importJobId="job-1" />);

    const skeletons = document.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows ImportStatusCard for in-progress job", () => {
    renderWithStore(<ImportStatusStep importJobId="job-1" />, {
      jobs: [baseJob],
    });

    expect(screen.getByText("Import Status")).toBeInTheDocument();
    expect(screen.getByText("50% complete")).toBeInTheDocument();
  });

  it("shows Go to Dashboard button when import completes", () => {
    renderWithStore(<ImportStatusStep importJobId="job-1" />, {
      jobs: [completedJob],
      stats: mockStats,
    });

    expect(screen.getByRole("button", { name: "Go to Dashboard" })).toBeInTheDocument();
  });

  it("shows ImportSummary when import completes and stats available", () => {
    renderWithStore(<ImportStatusStep importJobId="job-1" />, {
      jobs: [completedJob],
      stats: mockStats,
    });

    expect(screen.getByText("Data Summary")).toBeInTheDocument();
  });

  it("always shows Skip to Dashboard link", () => {
    renderWithStore(<ImportStatusStep importJobId="job-1" />, {
      jobs: [baseJob],
    });

    expect(screen.getByText("Skip to Dashboard")).toBeInTheDocument();
  });

  it("navigates to /feed when Go to Dashboard is clicked", () => {
    renderWithStore(<ImportStatusStep importJobId="job-1" />, {
      jobs: [completedJob],
      stats: mockStats,
    });

    fireEvent.click(screen.getByRole("button", { name: "Go to Dashboard" }));
    expect(mockPush).toHaveBeenCalledWith("/feed");
  });

  it("navigates to /feed when Skip to Dashboard is clicked", () => {
    renderWithStore(<ImportStatusStep importJobId="job-1" />, {
      jobs: [baseJob],
    });

    fireEvent.click(screen.getByText("Skip to Dashboard"));
    expect(mockPush).toHaveBeenCalledWith("/feed");
  });
});
