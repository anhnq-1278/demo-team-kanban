import { test, expect } from "@playwright/test";

/**
 * T043 – End-to-end Playwright test for the Kanban board.
 *
 * Tests the full user journey:
 *   1. Home page lists seed boards
 *   2. Navigating to a board shows columns and cards
 *   3. Using the "Move to…" keyboard alternative moves a card to another column
 *   4. Page reload confirms persistence via localStorage
 */

test.describe("Team Kanban – smoke", () => {
  test("home page shows seed boards", async ({ page }) => {
    await page.goto("/");
    // At least one seed board should be visible
    await expect(page.getByText("Website Redesign")).toBeVisible();
  });

  test("navigates to a board and shows columns", async ({ page }) => {
    await page.goto("/");
    // Click on the first seed board
    await page.getByText("Website Redesign").click();
    // Board page should show standard Kanban columns
    await expect(page.getByText("To Do")).toBeVisible();
    await expect(page.getByText("In Progress")).toBeVisible();
    await expect(page.getByText("Done")).toBeVisible();
  });

  test("move card to another column via keyboard menu persists on reload", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByText("Website Redesign").click();

    // Wait for the board columns to render
    await page.waitForSelector('[aria-label="Drag card to reorder"]', {
      timeout: 5000,
    });

    // Pick a card from the "To Do" column
    const todoColumn = page.locator("div").filter({ hasText: /^To Do/ }).first();
    const firstCard = todoColumn.locator('[aria-label="Drag card to reorder"]').first();
    const cardContainer = firstCard.locator("..");

    // Record the card title
    const cardTitle = await cardContainer
      .locator("p.text-sm.font-medium")
      .first()
      .textContent();
    expect(cardTitle).toBeTruthy();

    // Hover the card to reveal the "Move to" button
    await cardContainer.hover();
    const moveToButton = page
      .getByRole("button", { name: "Move card to another column" })
      .first();
    await expect(moveToButton).toBeVisible({ timeout: 3000 });
    await moveToButton.click();

    // Select "In Progress" from the dropdown
    await page.getByRole("menuitem", { name: "In Progress" }).click();

    // The card should now appear in "In Progress"
    const inProgressColumn = page
      .locator("div")
      .filter({ hasText: /^In Progress/ })
      .first();
    await expect(inProgressColumn.getByText(cardTitle!)).toBeVisible({
      timeout: 3000,
    });

    // Confirm it is no longer in "To Do"
    await expect(todoColumn.getByText(cardTitle!)).not.toBeVisible();

    // Reload and verify persistence
    await page.reload();
    await page.waitForSelector('[aria-label="Drag card to reorder"]', {
      timeout: 5000,
    });

    const inProgressAfterReload = page
      .locator("div")
      .filter({ hasText: /^In Progress/ })
      .first();
    await expect(inProgressAfterReload.getByText(cardTitle!)).toBeVisible({
      timeout: 5000,
    });
  });
});
