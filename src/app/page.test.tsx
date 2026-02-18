/// <reference types="vitest" />

import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("Landing page", () => {
  it("renders the hero copy and primary CTA", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /from invisible commits to living xp/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /connect github/i })).toHaveAttribute("href", "/sign-in");
  });

  it("shows trust cues that mention x-xpull-correlation-id", () => {
    render(<Home />);
    expect(screen.getByText(/x-xpull-correlation-id/i)).toBeInTheDocument();
  });
});
