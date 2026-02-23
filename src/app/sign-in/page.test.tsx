/// <reference types="vitest" />

import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { signIn } from "next-auth/react";
import SignInPage from "./page";

vi.mock("next-auth/react", () => {
  return {
    signIn: vi.fn(),
  };
});

const mockedSignIn = vi.mocked(signIn);

describe("Sign-in page", () => {
  beforeEach(() => {
    mockedSignIn.mockClear();
  });

  it("renders the sign-in button and status text", () => {
    render(<SignInPage />);
    expect(screen.getByRole("button", { name: /sign in with github/i })).toBeInTheDocument();
    expect(screen.getByText(/analysis in progress/i)).toBeInTheDocument();
  });

  it("calls signIn when the button is clicked", () => {
    render(<SignInPage />);
    const button = screen.getByRole("button", { name: /sign in with github/i });
    fireEvent.click(button);
    expect(mockedSignIn).toHaveBeenCalledWith("github", { callbackUrl: "/onboarding" });
  });
});
