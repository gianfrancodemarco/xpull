/// <reference types="vitest" />

import { render, screen } from "@testing-library/react";

import DashboardView from "./dashboard-view";

describe("Dashboard view", () => {
  it("renders hero copy and stats", () => {
    render(<DashboardView userName="Jamie" userEmail="jamie@example.com" userAvatar="/avatar.png" />);
    expect(screen.getByRole("heading", { name: /story feed ready for jamie/i })).toBeInTheDocument();
    expect(screen.getByText(/weekly progress check/i)).toBeInTheDocument();
    expect(screen.getByText(/refresh feed/i)).toBeInTheDocument();
    expect(screen.getByText(/collected info/i)).toBeInTheDocument();
    expect(screen.getByText(/jamie@example.com/i)).toBeInTheDocument();
  });
});
