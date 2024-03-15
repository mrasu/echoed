import { test } from "@/fixtures/test";
import { expect } from "@playwright/test";
import { waitForSpan } from "echoed";
import {
  waitForSpanCreatedIn,
  waitForSpanFromPlaywrightFetch,
} from "echoed/playwright";

const SPAN_FILTER = {
  name: "oteldemo.ProductCatalogService/ListProducts",
  resource: {
    attributes: {
      "service.name": "productcatalogservice",
    },
  },
  attributes: {
    "rpc.method": "ListProducts",
  },
};

test("should open page", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await expect(page).toHaveTitle("OTel demo");

  const productList = page.locator("[data-cy=product-card]");
  await expect(productList).toHaveCount(10);

  const span = await waitForSpanCreatedIn(
    page.context(),
    /api\/products/,
    SPAN_FILTER,
  );
  const rpcSystem = span.attributes.find(
    (attr) => attr.key === "app.products.count",
  );
  expect(rpcSystem?.value?.intValue).toBe(10);
});

test("should create Span with context.request", async ({ context }) => {
  const response = await context.request.get(
    `http://localhost:8080/api/products`,
  );
  expect(response.status()).toBe(200);
  expect((await response.json()).length).toEqual(10);

  const span = await waitForSpanFromPlaywrightFetch(response, SPAN_FILTER);
  const rpcSystem = span.attributes.find(
    (attr) => attr.key === "app.products.count",
  );
  expect(rpcSystem?.value?.intValue).toBe(10);
});

test("should create Span with request.get", async ({ request }) => {
  const response = await request.get(`http://localhost:8080/api/products`);
  expect(response.status()).toBe(200);
  expect((await response.json()).length).toEqual(10);

  const span = await waitForSpanFromPlaywrightFetch(response, SPAN_FILTER);
  const rpcSystem = span.attributes.find(
    (attr) => attr.key === "app.products.count",
  );
  expect(rpcSystem?.value?.intValue).toBe(10);
});

test("should create Span with playwright.request.newContext", async ({
  playwright,
}) => {
  const apiContext = await playwright.request.newContext({
    baseURL: "http://localhost:8080",
  });

  const response = await apiContext.get(`/api/products`);
  expect(response.status()).toBe(200);
  expect((await response.json()).length).toEqual(10);

  const span = await waitForSpanFromPlaywrightFetch(response, SPAN_FILTER);
  const rpcSystem = span.attributes.find(
    (attr) => attr.key === "app.products.count",
  );
  expect(rpcSystem?.value?.intValue).toBe(10);
});

test("should create Span with fetch", async () => {
  const response = await fetch(`http://localhost:8080/api/products`);
  expect(response.status).toBe(200);
  expect((await response.json()).length).toEqual(10);

  const span = await waitForSpan(response, SPAN_FILTER);
  const rpcSystem = span.attributes.find(
    (attr) => attr.key === "app.products.count",
  );
  expect(rpcSystem?.value?.intValue).toBe(10);
});
