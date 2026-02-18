/// <reference types="vitest" />

import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));

import TopAppBar from "./AppBar";

describe("TopAppBar", () => {
  it("renders logo, nav links and user name", () => {
    render(<TopAppBar user={{ name: "Jane Dev", image: null }} />);

    expect(screen.getByText(/xpull/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByText(/jane dev/i)).toBeInTheDocument();
  });
});
