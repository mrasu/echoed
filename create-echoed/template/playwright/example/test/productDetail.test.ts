import { test } from "echoed/playwright/test";
// import { test } from "@/fixtures/test";
import { expect } from "@playwright/test";

test.describe("Product Detail Page", () => {
  test.use({ baseURL: "http://localhost:8080" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should validate the product detail page", async ({ page }) => {
    await page.locator("[data-cy=product-card]").first().click();
    await expect(page.locator("[data-cy=product-detail]")).toBeVisible();
    await expect(page.locator("[data-cy=product-picture]")).toBeVisible();
    await expect(page.locator("[data-cy=product-name]")).toBeVisible();
    await expect(page.locator("[data-cy=product-description]")).toBeVisible();
    await expect(page.locator("[data-cy=product-add-to-cart]")).toBeVisible();
    await expect(
      page
        .locator("[data-cy=recommendation-list]")
        .locator("[data-cy=product-card]"),
    ).toHaveCount(4);
    await expect(page.locator("[data-cy=ad]")).toBeVisible();
  });

  test("should add item to cart", async ({ page }) => {
    await page.locator("[data-cy=product-card]").first().click();
    await page.locator("[data-cy=product-add-to-cart]").click();

    await expect(page).toHaveURL(/\/cart$/);

    await expect(page.locator("[data-cy=cart-item-count]")).toHaveCount(1);
    await page.locator("[data-cy=cart-icon]").click();

    await expect(page.locator("[data-cy=cart-dropdown-item]")).toHaveCount(1);
  });
});
