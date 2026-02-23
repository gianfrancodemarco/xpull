import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import importsReducer from "../importsSlice";
import { ImportDashboard } from "./ImportDashboard";

const completedJob = {
  id: "job-1",
  userId: "user-1",
  status: "completed" as const,
  progress: 100,
  totalItems: 50,
  processedItems: 50,
  errorMessage: null,
  startedAt: "2026-01-15T10:00:00.000Z",
  completedAt: "2026-01-15T10:05:00.000Z",
  createdAt: "2026-01-15T09:59:00.000Z",
  updatedAt: "2026-01-15T10:05:00.000Z",
};

const inProgressJob = {
  ...completedJob,
  id: "job-2",
  status: "in_progress" as const,
  progress: 50,
  processedItems: 25,
  completedAt: null,
  createdAt: "2026-02-01T10:00:00.000Z",
  updatedAt: "2026-02-01T10:02:00.000Z",
};

const mockStats = {
  totalCommits: 100,
  totalPullRequests: 25,
  totalReviews: 15,
  languages: [{ language: "TypeScript", count: 50 }],
  earliestEventDate: "2025-01-01T00:00:00.000Z",
  latestEventDate: "2026-02-01T00:00:00.000Z",
};

function setupFetchMock(jobs: unknown[] = [], stats: unknown = mockStats) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) => {
      if (url === "/api/imports") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: jobs }),
        });
      }
      if (url === "/api/imports/stats") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: stats }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });
    }),
  );
}

function createStore() {
  return configureStore({
    reducer: { imports: importsReducer },
  });
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("ImportDashboard", () => {
  it("dispatches fetchImportJobs and fetchImportStats on mount", async () => {
    setupFetchMock();
    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <ImportDashboard />
        </Provider>,
      );
    });

    expect(fetch).toHaveBeenCalledWith("/api/imports");
    expect(fetch).toHaveBeenCalledWith("/api/imports/stats");
  });

  it("shows 'no import jobs' message when no jobs returned", async () => {
    setupFetchMock([]);
    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <ImportDashboard />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/No import jobs found/)).toBeInTheDocument();
    });
  });

  it("renders ImportStatusCard for latest job", async () => {
    setupFetchMock([completedJob]);
    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <ImportDashboard />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Import Status")).toBeInTheDocument();
      expect(screen.getByText("✅ Completed")).toBeInTheDocument();
    });
  });

  it("renders ImportSummary when completed import and stats exist", async () => {
    setupFetchMock([completedJob], mockStats);
    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <ImportDashboard />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Data Summary")).toBeInTheDocument();
      expect(screen.getByLabelText("100 Commits")).toBeInTheDocument();
    });
  });

  it("does not render ImportSummary without completed import", async () => {
    setupFetchMock([inProgressJob], mockStats);
    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <ImportDashboard />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Import Status")).toBeInTheDocument();
    });

    expect(screen.queryByText("Data Summary")).not.toBeInTheDocument();
  });

  it("shows import history accordion for past jobs", async () => {
    setupFetchMock([completedJob, inProgressJob], mockStats);
    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <ImportDashboard />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Import History (1)")).toBeInTheDocument();
    });
  });

  it("polls when an active import exists", async () => {
    setupFetchMock([inProgressJob]);
    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <ImportDashboard />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Import Status")).toBeInTheDocument();
    });

    const callsBefore = (fetch as ReturnType<typeof vi.fn>).mock.calls.length;

    await act(async () => {
      vi.advanceTimersByTime(5_000);
    });

    await waitFor(() => {
      const callsAfter = (fetch as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(callsAfter).toBeGreaterThan(callsBefore);
    });
  });

  it("displays error alert when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <ImportDashboard />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
    });
  });
});
