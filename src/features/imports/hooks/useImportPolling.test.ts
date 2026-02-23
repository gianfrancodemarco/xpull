import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import importsReducer from "../importsSlice";
import { useImportPolling } from "./useImportPolling";

function createStoreWithState(overrides: Record<string, unknown> = {}) {
  return configureStore({
    reducer: { imports: importsReducer },
    preloadedState: {
      imports: {
        jobs: [],
        stats: null,
        isLoading: false,
        isPolling: false,
        error: null,
        ...overrides,
      },
    },
  });
}

function createWrapper(store: ReturnType<typeof createStoreWithState>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store }, children);
  };
}

const inProgressJob = {
  id: "job-1",
  userId: "user-1",
  status: "in_progress" as const,
  progress: 50,
  totalItems: 100,
  processedItems: 50,
  errorMessage: null,
  startedAt: "2026-01-15T10:00:00.000Z",
  completedAt: null,
  createdAt: "2026-01-15T09:59:00.000Z",
  updatedAt: "2026-01-15T10:02:00.000Z",
};

const completedJob = {
  ...inProgressJob,
  status: "completed" as const,
  progress: 100,
  processedItems: 100,
  completedAt: "2026-01-15T10:05:00.000Z",
};

const pendingJob = {
  ...inProgressJob,
  status: "pending" as const,
  progress: 0,
  processedItems: 0,
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useImportPolling", () => {
  it("starts polling when an in_progress job exists", async () => {
    const store = createStoreWithState({ jobs: [inProgressJob] });

    renderHook(() => useImportPolling(), { wrapper: createWrapper(store) });

    expect(store.getState().imports.isPolling).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(5_000);
    });

    expect(fetch).toHaveBeenCalledWith("/api/imports");
  });

  it("starts polling when a pending job exists", async () => {
    const store = createStoreWithState({ jobs: [pendingJob] });

    renderHook(() => useImportPolling(), { wrapper: createWrapper(store) });

    expect(store.getState().imports.isPolling).toBe(true);
  });

  it("does not poll when only completed jobs exist", () => {
    const store = createStoreWithState({ jobs: [completedJob] });

    renderHook(() => useImportPolling(), { wrapper: createWrapper(store) });

    expect(store.getState().imports.isPolling).toBe(false);

    vi.advanceTimersByTime(10_000);

    const importsCalls = (fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
      (call: string[]) => call[0] === "/api/imports",
    );
    expect(importsCalls.length).toBe(0);
  });

  it("does not poll when only failed jobs exist", () => {
    const failedJob = { ...inProgressJob, status: "failed" as const, errorMessage: "err" };
    const store = createStoreWithState({ jobs: [failedJob] });

    renderHook(() => useImportPolling(), { wrapper: createWrapper(store) });

    expect(store.getState().imports.isPolling).toBe(false);
  });

  it("polls at 5-second intervals", async () => {
    const store = createStoreWithState({ jobs: [inProgressJob] });

    renderHook(() => useImportPolling(), { wrapper: createWrapper(store) });

    await act(async () => {
      vi.advanceTimersByTime(4_999);
    });

    const callsBefore = (fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
      (call: string[]) => call[0] === "/api/imports",
    ).length;

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    const callsAfter = (fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
      (call: string[]) => call[0] === "/api/imports",
    ).length;

    expect(callsAfter).toBeGreaterThan(callsBefore);
  });

  it("cleans up interval on unmount", async () => {
    const store = createStoreWithState({ jobs: [inProgressJob] });

    const { unmount } = renderHook(() => useImportPolling(), {
      wrapper: createWrapper(store),
    });

    const callsBeforeUnmount = (fetch as ReturnType<typeof vi.fn>).mock.calls.length;

    unmount();

    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });

    const callsAfterUnmount = (fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(callsAfterUnmount).toBe(callsBeforeUnmount);
  });

  it("does not start polling when no jobs exist", () => {
    const store = createStoreWithState({ jobs: [] });

    renderHook(() => useImportPolling(), { wrapper: createWrapper(store) });

    expect(store.getState().imports.isPolling).toBe(false);
  });
});
