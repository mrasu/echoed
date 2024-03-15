import { getSession } from "@/example/util/session";
import { test } from "@/fixtures/test";
import { expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.use({ baseURL: "http://localhost:8080" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should validate the home page", async ({ page }) => {
    await expect(page.locator("[data-cy=home-page]")).toBeVisible();
    await expect(
      page.locator("[data-cy=product-list]").locator("[data-cy=product-card]"),
    ).toHaveCount(10);

    const session = await getSession(page);

    await expect(page.locator("[data-cy=session-id]")).toContainText(
      session.userId,
    );
  });

  test("should change currency", async ({ page }) => {
    await page.locator("[data-cy=currency-switcher]").selectOption("EUR");
    await expect(
      page.locator("[data-cy=product-list]").locator("[data-cy=product-card]"),
    ).toHaveCount(10);
    await expect(page.locator("[data-cy=product-card]").first()).toContainText(
      "€",
    );
  });
});
