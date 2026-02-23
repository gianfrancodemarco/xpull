/// <reference types="vitest" />

import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));

import TopAppBar from "./AppBar";

describe("TopAppBar", () => {
  it("renders logo, nav links including Feed, and user name", () => {
    render(<TopAppBar user={{ name: "Jane Dev", image: null }} />);

    expect(screen.getByText(/xpull/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^dashboard$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^feed$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^settings$/i })).toBeInTheDocument();
    expect(screen.getByText(/jane dev/i)).toBeInTheDocument();
  });

  it("renders Feed link with correct href", () => {
    render(<TopAppBar user={{ name: "Test User", image: null }} />);

    const feedLink = screen.getByRole("link", { name: /^feed$/i });
    expect(feedLink).toHaveAttribute("href", "/feed");
  });

  it("renders mobile menu button", () => {
    render(<TopAppBar user={{ name: "Jane Dev", image: null }} />);

    expect(screen.getByLabelText("menu")).toBeInTheDocument();
  });

  it("opens drawer when mobile menu is clicked", () => {
    render(<TopAppBar user={{ name: "Jane Dev", image: null }} />);

    fireEvent.click(screen.getByLabelText("menu"));

    const drawerItems = screen.getAllByText(/sign out/i);
    expect(drawerItems.length).toBeGreaterThanOrEqual(1);
  });

  it("renders fallback name when no user provided", () => {
    render(<TopAppBar />);

    expect(screen.getByText(/xpull citizen/i)).toBeInTheDocument();
  });
});
