import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { WhatChangedPanel } from "./WhatChangedPanel";

describe("WhatChangedPanel", () => {
  it("renders coming soon state when no props provided", () => {
    render(<WhatChangedPanel />);

    expect(screen.getByText("Since last visit")).toBeInTheDocument();
    expect(screen.getByText(/xp tracking coming soon/i)).toBeInTheDocument();
  });

  it("renders XP delta when provided", () => {
    render(<WhatChangedPanel xpDelta={420} />);

    expect(screen.getByText("+420 XP")).toBeInTheDocument();
    expect(screen.getByText("XP delta")).toBeInTheDocument();
  });

  it("renders level change when provided", () => {
    render(<WhatChangedPanel levelChange={2} />);

    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.getByText("Level movement")).toBeInTheDocument();
  });

  it("renders unlock count when provided", () => {
    render(<WhatChangedPanel unlockCount={5} />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Unlocks")).toBeInTheDocument();
  });

  it("renders all stats together", () => {
    render(<WhatChangedPanel xpDelta={100} levelChange={1} unlockCount={3} />);

    expect(screen.getByText("+100 XP")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("handles negative XP delta", () => {
    render(<WhatChangedPanel xpDelta={-50} />);

    expect(screen.getByText("-50 XP")).toBeInTheDocument();
  });
});
