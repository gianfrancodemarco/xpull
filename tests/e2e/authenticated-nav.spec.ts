import { test, expect } from "@playwright/test";

test.describe("Authenticated navigation", () => {
  test("navigates between dashboard and settings via AppBar", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard");

    // Wait for AppBar to render
    await expect(page.locator("text=Dashboard")).toBeVisible();

    await page.click("text=Settings");
    await expect(page).toHaveURL(/\/settings/);

    await page.click("text=Dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
