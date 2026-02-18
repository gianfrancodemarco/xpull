import { test, expect } from "@playwright/test";

test.describe("Landing experience", () => {
  test("shows the Neo Arcade hero and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /from invisible commits to living xp/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /connect github/i })).toHaveAttribute("href", "/sign-in");
    await expect(page.getByText(/analysis ready/i)).toBeVisible();
  });

  test("can navigate to sign-in and see analysis messaging", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("button", { name: /sign in with github/i })).toBeEnabled();
    await expect(page.getByText(/analysis in progress/i)).toBeVisible();
  });
});
