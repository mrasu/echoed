import { expect, test } from "@playwright/test";

test("should Open page", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await expect(page).toHaveTitle("OTel demo");

  const productList = page.locator("[data-cy=product-card]");
  await expect(productList).toHaveCount(10);
});

test("shoud create request with context.request", async ({ context }) => {
  const response = await context.request.get(
    `http://localhost:8080/api/products`,
  );
  expect(response.status()).toBe(200);
  expect((await response.json()).length).toEqual(10);
});

test("shoud create request with request.get", async ({ request }) => {
  const response = await request.get(`http://localhost:8080/api/products`);
  expect(response.status()).toBe(200);
  expect((await response.json()).length).toEqual(10);
});

test("shoud create request with playwright.request.newContext", async ({
  playwright,
}) => {
  const apiContext = await playwright.request.newContext({
    baseURL: "http://localhost:8080",
  });

  const response = await apiContext.get(`/api/products`);
  expect(response.status()).toBe(200);
  expect((await response.json()).length).toEqual(10);
});

test("shoud create request with fetch", async () => {
  const response = await fetch(`http://localhost:8080/api/products`);
  expect(response.status).toBe(200);
  expect((await response.json()).length).toEqual(10);
});
