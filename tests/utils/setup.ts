import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({ href, children, ...rest }: { href?: string; children: React.ReactNode }) =>
      React.createElement("a", { href: typeof href === "string" ? href : "#", ...rest }, children),
  };
});
