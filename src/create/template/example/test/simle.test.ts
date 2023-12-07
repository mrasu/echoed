import crypto from "crypto";

describe("Simple test", () => {
  it("should pass", async () => {
    const sessionId = crypto.randomUUID();

    const response = await fetch(
      `http://localhost:8080/api/cart?sessionId=${sessionId}&currencyCode=USD`,
    );
    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.items.length).toBe(0);
  });
});
