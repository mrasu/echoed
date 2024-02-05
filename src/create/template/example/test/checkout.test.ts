import { Session, createSession } from "../util/session";

describe("Checkout Flow", () => {
  const firstProductId = "OLJCESPC7Z";
  const secondProductId = "HQTGWGPNH4";

  const addToCart = async (
    session: Session,
    productId: string,
    quantity: number,
  ) => {
    return await fetch(
      `http://localhost:8080/api/cart?currencyCode=${session.currencyCode}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: { productId, quantity },
          userId: session.userId,
        }),
      },
    );
  };

  const defaultCheckoutData = {
    userId: undefined,
    email: "someone@example.com",
    address: {
      streetAddress: "1600 Amphitheatre Parkway",
      state: "CA",
      country: "United States",
      city: "Mountain View",
      zipCode: "94043",
    },
    userCurrency: "USD",
    creditCard: {
      creditCardCvv: 672,
      creditCardExpirationMonth: 1,
      creditCardExpirationYear: 2030,
      creditCardNumber: "4432-8015-6152-0454",
    },
  };

  it("should create an order with two items", async () => {
    const session = createSession();

    const firstAddToCartResponse = await addToCart(session, firstProductId, 1);
    expect(firstAddToCartResponse.status).toBe(200);
    expect(await firstAddToCartResponse.json()).toEqual({
      items: [{ productId: firstProductId, quantity: 1 }],
      userId: session.userId,
    });

    const secondAddToCartResponse = await addToCart(
      session,
      secondProductId,
      1,
    );
    expect(secondAddToCartResponse.status).toBe(200);
    expect(await secondAddToCartResponse.json()).toEqual({
      items: [
        { productId: firstProductId, quantity: 1 },
        { productId: secondProductId, quantity: 1 },
      ],
      userId: session.userId,
    });

    const checkoutResponse = await fetch(
      `http://localhost:8080/api/checkout?currencyCode=${session.currencyCode}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...defaultCheckoutData,
          userId: session.userId,
        }),
      },
    );

    expect(checkoutResponse.status).toBe(200);

    const checkoutResponseBody = await checkoutResponse.json();
    expect(checkoutResponseBody.items.length).toBe(2);
    expect(checkoutResponseBody.items[0].item.productId).toBe(firstProductId);
    expect(checkoutResponseBody.items[1].item.productId).toBe(secondProductId);
  });
});
