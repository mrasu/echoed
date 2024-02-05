import { createSession } from "../util/session";

describe("Cart", () => {
  const productId = "OLJCESPC7Z";

  it("should add item to cart", async () => {
    const session = createSession();

    const cartUrl = `http://localhost:8080/api/cart?sessionId=${session.userId}&currencyCode=${session.currencyCode}`;
    const beforeCartResponse = await fetch(cartUrl);
    expect((await beforeCartResponse.json()).items.length).toBe(0);

    const addToCartResponse = await fetch(
      `http://localhost:8080/api/cart?currencyCode=${session.currencyCode}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: { productId, quantity: 1 },
          userId: session.userId,
        }),
      },
    );
    expect(addToCartResponse.status).toBe(200);
    expect(await addToCartResponse.json()).toEqual({
      items: [{ productId, quantity: 1 }],
      userId: session.userId,
    });

    const afterCartResponse = await fetch(cartUrl);
    expect((await afterCartResponse.json()).items.length).toBe(1);
  });
});
