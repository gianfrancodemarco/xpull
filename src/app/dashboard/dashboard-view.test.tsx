import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import importsReducer from "~/features/imports/importsSlice";

import DashboardView from "./dashboard-view";

const mockStats = {
  totalCommits: 100,
  totalPullRequests: 25,
  totalReviews: 15,
  languages: [
    { language: "TypeScript", count: 50 },
    { language: "Python", count: 30 },
  ],
  earliestEventDate: "2025-01-01T00:00:00.000Z",
  latestEventDate: "2026-02-01T00:00:00.000Z",
};

function setupFetchMock(stats: unknown = mockStats) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) => {
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
  vi.restoreAllMocks();
});

describe("DashboardView", () => {
  it("renders hero copy and stats", async () => {
    setupFetchMock();
    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <DashboardView userName="Jamie" userEmail="jamie@example.com" userAvatar="/avatar.png" />
        </Provider>,
      );
    });

    expect(screen.getByRole("heading", { name: /story feed ready for jamie/i })).toBeInTheDocument();
    expect(screen.getByText(/weekly progress check/i)).toBeInTheDocument();
    expect(screen.getByText(/refresh feed/i)).toBeInTheDocument();
    expect(screen.getByText(/jamie@example.com/i)).toBeInTheDocument();
  });

  it("shows real collected data when import stats are available", async () => {
    setupFetchMock(mockStats);
    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <DashboardView userName="Jamie" />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("Commits")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("Pull Requests")).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText("Reviews")).toBeInTheDocument();
    });
  });

  it("shows empty state with link to settings when no data", async () => {
    const emptyStats = {
      totalCommits: 0,
      totalPullRequests: 0,
      totalReviews: 0,
      languages: [],
      earliestEventDate: null,
      latestEventDate: null,
    };
    setupFetchMock(emptyStats);
    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <DashboardView userName="Jamie" />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/no data yet/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /go to settings/i })).toHaveAttribute("href", "/settings");
    });
  });

  it("still renders hero and feed sections even without import data", async () => {
    const emptyStats = {
      totalCommits: 0,
      totalPullRequests: 0,
      totalReviews: 0,
      languages: [],
      earliestEventDate: null,
      latestEventDate: null,
    };
    setupFetchMock(emptyStats);
    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <DashboardView userName="Jamie" userEmail="jamie@example.com" userAvatar="/avatar.png" />
        </Provider>,
      );
    });

    expect(screen.getByRole("heading", { name: /story feed ready for jamie/i })).toBeInTheDocument();
    expect(screen.getByText(/weekly progress check/i)).toBeInTheDocument();
    expect(screen.getByText(/what changed since yesterday/i)).toBeInTheDocument();
  });
});
