import { createSession } from "../util/session";
import { waitForSpan } from "echoed";

describe("Manual test", () => {
  it("should pass", async () => {
    const session = createSession();

    const response = await fetch(
      `http://localhost:8080/api/cart?sessionId=${session.userId}&currencyCode=${session.currencyCode}`,
    );
    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.items.length).toBe(0);
  });

  it("should get Span", async () => {
    const session = createSession();

    const response = await fetch(
      `http://localhost:8080/api/products?currencyCode${session.currencyCode}`,
    );
    expect(response.status).toBe(200);

    const span = await waitForSpan(response, {
      name: "oteldemo.ProductCatalogService/ListProducts",
      resource: {
        attributes: {
          "service.name": "productcatalogservice",
        },
      },
      attributes: {
        "rpc.method": "ListProducts",
      },
    });
    const rpcSystem = span.attributes.find(
      (attr) => attr.key === "app.products.count",
    );
    expect(rpcSystem?.value?.intValue).toBe(10);
  });
});
