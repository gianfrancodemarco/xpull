import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { ImportKickoffStep } from "./ImportKickoffStep";

const selectedRepoIds = ["user/repo-one", "user/repo-two"];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ImportKickoffStep", () => {
  it("shows loading state while starting import", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    render(
      <ImportKickoffStep
        selectedRepoIds={selectedRepoIds}
        onImportStarted={vi.fn()}
      />,
    );

    expect(screen.getByText("Preparing your import...")).toBeInTheDocument();
    expect(screen.getByText("Setting up 2 repositories")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("calls POST /api/imports with selectedRepoIds", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: "job-123" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <ImportKickoffStep
        selectedRepoIds={selectedRepoIds}
        onImportStarted={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedRepoIds }),
      });
    });
  });

  it("calls onImportStarted with job ID on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: "job-123" } }),
      }),
    );

    const onImportStarted = vi.fn();

    render(
      <ImportKickoffStep
        selectedRepoIds={selectedRepoIds}
        onImportStarted={onImportStarted}
      />,
    );

    await waitFor(() => {
      expect(onImportStarted).toHaveBeenCalledWith("job-123");
    });
  });

  it("shows error alert with retry on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) }),
    );

    render(
      <ImportKickoffStep
        selectedRepoIds={selectedRepoIds}
        onImportStarted={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Could not start the import/)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("retries import when retry button is clicked", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { id: "job-456" } }),
      });
    vi.stubGlobal("fetch", mockFetch);

    const onImportStarted = vi.fn();

    render(
      <ImportKickoffStep
        selectedRepoIds={selectedRepoIds}
        onImportStarted={onImportStarted}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(onImportStarted).toHaveBeenCalledWith("job-456");
    });
  });

  it("uses singular 'repository' for single repo", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    render(
      <ImportKickoffStep
        selectedRepoIds={["user/repo-one"]}
        onImportStarted={vi.fn()}
      />,
    );

    expect(screen.getByText("Setting up 1 repository")).toBeInTheDocument();
  });
});
