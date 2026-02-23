import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ImportSummary, ImportSummarySkeleton } from "./ImportSummary";
import type { ImportStatsResponse } from "../schema";

const fullStats: ImportStatsResponse = {
  totalRepositories: 8,
  totalCommits: 1250,
  totalPullRequests: 180,
  totalReviews: 95,
  languages: [
    { language: "TypeScript", count: 500 },
    { language: "Python", count: 300 },
    { language: "Go", count: 100 },
  ],
  earliestEventDate: "2024-06-15T00:00:00.000Z",
  latestEventDate: "2026-02-01T00:00:00.000Z",
};

const emptyStats: ImportStatsResponse = {
  totalRepositories: 0,
  totalCommits: 0,
  totalPullRequests: 0,
  totalReviews: 0,
  languages: [],
  earliestEventDate: null,
  latestEventDate: null,
};

describe("ImportSummary", () => {
  it("renders stat cards with counts", () => {
    render(<ImportSummary stats={fullStats} />);

    expect(screen.getByText("Data Summary")).toBeInTheDocument();
    expect(screen.getByLabelText("1250 Commits")).toBeInTheDocument();
    expect(screen.getByLabelText("180 Pull Requests")).toBeInTheDocument();
    expect(screen.getByLabelText("95 Reviews")).toBeInTheDocument();
  });

  it("renders language chips", () => {
    render(<ImportSummary stats={fullStats} />);

    expect(screen.getByText("TypeScript (500)")).toBeInTheDocument();
    expect(screen.getByText("Python (300)")).toBeInTheDocument();
    expect(screen.getByText("Go (100)")).toBeInTheDocument();
  });

  it("renders date range", () => {
    render(<ImportSummary stats={fullStats} />);

    const dateText = screen.getByText(/Date range:/);
    expect(dateText).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(<ImportSummary stats={emptyStats} />);

    expect(screen.getByText("No data imported yet")).toBeInTheDocument();
  });

  it("does not render stat cards in empty state", () => {
    render(<ImportSummary stats={emptyStats} />);

    expect(screen.queryByLabelText(/Commits/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Pull Requests/)).not.toBeInTheDocument();
  });

  it("never renders repository names in output (privacy)", () => {
    render(<ImportSummary stats={fullStats} />);

    const html = document.body.innerHTML;
    expect(html).not.toContain("repositoryName");
    expect(html).not.toContain("repoName");
    expect(html).not.toContain("filePath");
    expect(html).not.toContain("ownerLogin");
  });

  it("only renders aggregate counts, language names, and dates", () => {
    render(<ImportSummary stats={fullStats} />);

    expect(screen.getByText("TypeScript (500)")).toBeInTheDocument();
    expect(screen.getByText("Python (300)")).toBeInTheDocument();
    expect(screen.getByText("Go (100)")).toBeInTheDocument();
    expect(screen.getByLabelText("1250 Commits")).toBeInTheDocument();
  });
});

describe("ImportSummarySkeleton", () => {
  it("renders skeleton elements", () => {
    render(<ImportSummarySkeleton />);

    const skeletons = document.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
