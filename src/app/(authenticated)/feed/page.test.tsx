import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import FeedPage from "./page";

describe("FeedPage", () => {
  it("renders page title and subtitle", () => {
    render(<FeedPage />);

    expect(screen.getByRole("heading", { name: /story feed/i })).toBeInTheDocument();
    expect(screen.getByText(/see what your team has been achieving/i)).toBeInTheDocument();
  });

  it("renders WhatChangedPanel in coming-soon state", () => {
    render(<FeedPage />);

    expect(screen.getByText("Since last visit")).toBeInTheDocument();
    expect(screen.getByText(/xp tracking coming soon/i)).toBeInTheDocument();
  });

  it("renders Recent Activity section header", () => {
    render(<FeedPage />);

    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  });

  it("renders mock feed items with author names", () => {
    render(<FeedPage />);

    expect(screen.getByText("Alice Chen")).toBeInTheDocument();
    expect(screen.getByText("Bob Martinez")).toBeInTheDocument();
    expect(screen.getByText("Carol Park")).toBeInTheDocument();
    expect(screen.getByText("Dan Okafor")).toBeInTheDocument();
    expect(screen.getByText("Eva Lindström")).toBeInTheDocument();
    expect(screen.getByText("Frank Russo")).toBeInTheDocument();
  });

  it("renders feed item titles", () => {
    render(<FeedPage />);

    expect(screen.getByText("Reached Level 12!")).toBeInTheDocument();
    expect(screen.getByText("Streak Master Badge Earned")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Branch Extended")).toBeInTheDocument();
    expect(screen.getByText("First Code Review Pull")).toBeInTheDocument();
    expect(screen.getByText("New Repo Onboarded")).toBeInTheDocument();
    expect(screen.getByText(/league promotion/i)).toBeInTheDocument();
  });

  it("renders timestamps on feed items", () => {
    render(<FeedPage />);

    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
    expect(screen.getByText("5 hours ago")).toBeInTheDocument();
    expect(screen.getAllByText("Yesterday").length).toBe(2);
  });

  it("renders milestone and achievement labels", () => {
    render(<FeedPage />);

    const milestoneChips = screen.getAllByText("milestone");
    expect(milestoneChips.length).toBe(3);
    const achievementChips = screen.getAllByText("achievement");
    expect(achievementChips.length).toBe(3);
  });

  it("renders NextActionModule with import CTA", () => {
    render(<FeedPage />);

    expect(screen.getByText("Import your history to join the feed")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /go to settings.*coming soon/i });
    expect(button).toBeDisabled();
  });
});
