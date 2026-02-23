import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { RepoSelectionStep } from "./RepoSelectionStep";

const mockRepos = [
  {
    name: "repo-one",
    fullName: "user/repo-one",
    language: "TypeScript",
    stars: 42,
    isPrivate: false,
    updatedAt: new Date().toISOString(),
  },
  {
    name: "repo-two",
    fullName: "user/repo-two",
    language: null,
    stars: 0,
    isPrivate: true,
    updatedAt: new Date(Date.now() - 86_400_000 * 5).toISOString(),
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

function mockFetchSuccess() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockRepos }),
    }),
  );
}

function mockFetchFailure() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    }),
  );
}

describe("RepoSelectionStep", () => {
  it("shows loading skeletons while fetching", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    render(<RepoSelectionStep onContinue={vi.fn()} />);

    expect(screen.getByRole("status", { name: "Loading repositories" })).toBeInTheDocument();
  });

  it("renders repo list after fetch", async () => {
    mockFetchSuccess();

    render(<RepoSelectionStep onContinue={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("repo-one")).toBeInTheDocument();
    });
    expect(screen.getByText("repo-two")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("42 stars")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("shows error alert with retry on fetch failure", async () => {
    mockFetchFailure();

    render(<RepoSelectionStep onContinue={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Could not load your repositories/)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("continue button is disabled when no repos selected", async () => {
    mockFetchSuccess();

    render(<RepoSelectionStep onContinue={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("repo-one")).toBeInTheDocument();
    });

    const continueBtn = screen.getByRole("button", { name: /Continue/ });
    expect(continueBtn).toBeDisabled();
  });

  it("enables continue button when a repo is selected", async () => {
    mockFetchSuccess();

    render(<RepoSelectionStep onContinue={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("repo-one")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Select repo-one"));

    const continueBtn = screen.getByRole("button", { name: /Continue/ });
    expect(continueBtn).not.toBeDisabled();
  });

  it("calls onContinue with selected repo fullNames", async () => {
    mockFetchSuccess();
    const onContinue = vi.fn();

    render(<RepoSelectionStep onContinue={onContinue} />);

    await waitFor(() => {
      expect(screen.getByText("repo-one")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Select repo-one"));
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));

    expect(onContinue).toHaveBeenCalledWith(["user/repo-one"]);
  });

  it("Select All selects all repos", async () => {
    mockFetchSuccess();

    render(<RepoSelectionStep onContinue={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("repo-one")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Select All" }));

    const continueBtn = screen.getByRole("button", { name: /Continue \(2 selected\)/ });
    expect(continueBtn).not.toBeDisabled();
  });

  it("Deselect All clears selection", async () => {
    mockFetchSuccess();

    render(<RepoSelectionStep onContinue={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("repo-one")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Select All" }));
    fireEvent.click(screen.getByRole("button", { name: "Deselect All" }));

    const continueBtn = screen.getByRole("button", { name: /Continue/ });
    expect(continueBtn).toBeDisabled();
  });
});
