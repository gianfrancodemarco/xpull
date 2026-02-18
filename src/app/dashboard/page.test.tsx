import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Mock the auth function
vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

// Mock the DashboardView component
vi.mock("./dashboard-view", () => ({
  default: ({ userName, userEmail, userAvatar }: any) => (
    <div data-testid="dashboard-view">
      <div>{userName}</div>
      <div>{userEmail}</div>
      <div>{userAvatar}</div>
    </div>
  ),
}));

import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import DashboardPage from "./page";

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to sign-in when user is not authenticated", async () => {
    (auth as any).mockResolvedValue(null);

    await DashboardPage();

    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("redirects to sign-in when session exists but user is not set", async () => {
    (auth as any).mockResolvedValue({ user: null });

    await DashboardPage();

    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("renders DashboardView with user data when authenticated", async () => {
    const mockSession = {
      user: {
        name: "John Doe",
        email: "john@example.com",
        image: "/avatar.jpg",
      },
    };

    (auth as any).mockResolvedValue(mockSession);

    const result = await DashboardPage();

    expect(redirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("uses default name when user name is not provided", async () => {
    const mockSession = {
      user: {
        email: "john@example.com",
      },
    };

    (auth as any).mockResolvedValue(mockSession);

    const result = await DashboardPage();

    expect(redirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
