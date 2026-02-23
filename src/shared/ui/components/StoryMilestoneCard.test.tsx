import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { StoryMilestoneCard } from "./StoryMilestoneCard";

describe("StoryMilestoneCard", () => {
  it("renders title, description, and label", () => {
    render(
      <StoryMilestoneCard
        title="Level Up!"
        description="You reached a new level."
        label="milestone"
      />,
    );

    expect(screen.getByText("Level Up!")).toBeInTheDocument();
    expect(screen.getByText("You reached a new level.")).toBeInTheDocument();
    expect(screen.getByText("milestone")).toBeInTheDocument();
  });

  it("renders timestamp when provided", () => {
    render(
      <StoryMilestoneCard
        title="Badge Unlocked"
        description="New badge earned."
        label="achievement"
        timestamp="2 hours ago"
      />,
    );

    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const handleAction = vi.fn();
    render(
      <StoryMilestoneCard
        title="Test"
        description="Desc"
        label="milestone"
        action={{ label: "View Details", onClick: handleAction }}
      />,
    );

    const button = screen.getByRole("button", { name: /view details/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledOnce();
  });

  it("shows coming soon text for placeholder variant", () => {
    render(
      <StoryMilestoneCard
        title="Placeholder"
        description="This is a placeholder."
        label="placeholder"
        variant="placeholder"
      />,
    );

    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it("does not show coming soon for milestone variant", () => {
    render(
      <StoryMilestoneCard
        title="Real Card"
        description="Real content."
        label="milestone"
        variant="milestone"
      />,
    );

    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });
});
