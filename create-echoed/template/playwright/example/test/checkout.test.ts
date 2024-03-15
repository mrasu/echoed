import { test } from "@/fixtures/test";
import { expect } from "@playwright/test";
import { waitForSpanCreatedIn } from "echoed/playwright";

test.describe("Checkout Flow", () => {
  test.use({ baseURL: "http://localhost:8080" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should create an order with two items", async ({ page }) => {
    await page.locator("[data-cy=product-card]").first().click();
    await page.locator("[data-cy=product-add-to-cart]").first().click();

    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.locator("[data-cy=cart-item-count]")).toContainText("1");

    await page.goto("/");
    await page.locator("[data-cy=product-card]").last().click();
    await page.locator("[data-cy=product-add-to-cart]").click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.locator("[data-cy=cart-item-count]")).toContainText("2");

    await page.locator("[data-cy=cart-icon]").click();
    await page.locator("[data-cy=cart-go-to-shopping]").click();
    await expect(page).toHaveURL(/\/cart$/);

    await page.locator("[data-cy=checkout-place-order]").click();
    await expect(page).toHaveURL(/\/checkout/);

    await expect(page.locator("[data-cy=checkout-item]")).toHaveCount(2);

    const span = await waitForSpanCreatedIn(page.context(), /api\/checkout/, {
      name: "grpc.oteldemo.PaymentService/Charge",
      resource: {
        attributes: {
          "service.name": "paymentservice",
        },
      },
      attributes: {
        "rpc.method": "Charge",
      },
    });

    const amountAttribute = span.attributes.find(
      (attr) => attr.key === "app.payment.amount",
    );
    expect(amountAttribute?.value?.doubleValue).toBe(120.749999999);
  });
});
