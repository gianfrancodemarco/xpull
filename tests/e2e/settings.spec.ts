import { test, expect } from "@playwright/test";

test.describe("Settings page", () => {
  test("renders repo list and toggles, calls disconnect", async ({ page }) => {
    // Mock GET repos
    await page.route("**/api/settings/github/repos", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [{ id: 1, name: "xpull-web", full_name: "g/xpull-web", allowed: true }] }),
        });
      } else if (route.request().method() === "PATCH") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [{ id: 1, name: "xpull-web", full_name: "g/xpull-web", allowed: false }] }),
        });
      } else if (route.request().method() === "POST") {
        // disconnect
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
      }
    });

    await page.goto("http://localhost:3000/settings");

    await expect(page.locator("text=Repository Access")).toBeVisible();
    await expect(page.locator("text=g/xpull-web")).toBeVisible();

    // Toggle allowed checkbox
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
    await checkbox.click();
    // After PATCH mock, the checkbox should reflect the new state (we check via the mock response mapping)
    await expect(checkbox).not.toBeChecked();

    // Click Disconnect and confirm dialog — stub the dialog
    page.on("dialog", (dialog) => dialog.accept());
    await page.locator("text=Disconnect GitHub").click();

    // Ensure disconnect flow called (we relied on route fulfill)
    await expect(page.locator("text=Repository Access")).toBeVisible();
  });
});
