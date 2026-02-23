import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import FeedPage from "./page";

describe("FeedPage", () => {
  it("renders page title and subtitle", () => {
    render(<FeedPage />);

    expect(screen.getByRole("heading", { name: /story feed/i })).toBeInTheDocument();
    expect(screen.getByText(/your developer journey, one milestone at a time/i)).toBeInTheDocument();
  });

  it("renders WhatChangedPanel in coming-soon state", () => {
    render(<FeedPage />);

    expect(screen.getByText("Since last visit")).toBeInTheDocument();
    expect(screen.getByText(/xp tracking coming soon/i)).toBeInTheDocument();
  });

  it("renders placeholder StoryMilestoneCards", () => {
    render(<FeedPage />);

    expect(screen.getByText("Level Up!")).toBeInTheDocument();
    expect(screen.getByText("New Badge Unlocked")).toBeInTheDocument();
    expect(screen.getByText("Skill Branch Growing")).toBeInTheDocument();
  });

  it("renders NextActionModule in coming-soon state", () => {
    render(<FeedPage />);

    expect(screen.getByText("Start your first import")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /go to settings.*coming soon/i });
    expect(button).toBeDisabled();
  });

  it("shows milestone and achievement labels", () => {
    render(<FeedPage />);

    const milestoneChips = screen.getAllByText("milestone");
    expect(milestoneChips.length).toBe(2);
    expect(screen.getByText("achievement")).toBeInTheDocument();
  });
});
