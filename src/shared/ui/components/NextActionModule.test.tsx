import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { NextActionModule } from "./NextActionModule";

describe("NextActionModule", () => {
  it("renders title, description, and action label", () => {
    render(
      <NextActionModule
        title="Review your imports"
        description="Check your latest GitHub import for accuracy."
        actionLabel="Go to Imports"
      />,
    );

    expect(screen.getByText("Review your imports")).toBeInTheDocument();
    expect(screen.getByText(/check your latest github import/i)).toBeInTheDocument();
    expect(screen.getByText("Next Step")).toBeInTheDocument();
  });

  it("shows coming soon variant when no onAction provided", () => {
    render(
      <NextActionModule
        title="Explore Skills"
        description="Open the skill tree."
        actionLabel="Open Skill Tree"
      />,
    );

    const button = screen.getByRole("button", { name: /open skill tree.*coming soon/i });
    expect(button).toBeDisabled();
  });

  it("calls onAction when button is clicked", () => {
    const handleAction = vi.fn();
    render(
      <NextActionModule
        title="Do Something"
        description="Action available."
        actionLabel="Act Now"
        onAction={handleAction}
      />,
    );

    const button = screen.getByRole("button", { name: /act now/i });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledOnce();
  });

  it("renders the overline label", () => {
    render(
      <NextActionModule
        title="Test"
        description="Desc"
        actionLabel="Do it"
      />,
    );

    expect(screen.getByText("Next Step")).toBeInTheDocument();
  });
});
