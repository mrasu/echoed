import { defaultSession } from "../util/session";

describe("Simple test", () => {
  it("should pass", async () => {
    const session = defaultSession();

    const response = await fetch(
      `http://localhost:8080/api/cart?sessionId=${session.userId}&currencyCode=${session.currencyCode}`,
    );
    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.items.length).toBe(0);
  });

  it("should fail", async () => {
    const session = defaultSession();

    const response = await fetch(
      `http://localhost:8080/api/cart?sessionId=${session.userId}&currencyCode=${session.currencyCode}`,
    );
    expect(response.status).toBe(200);

    const body = await response.json();

    // This comparison should fail
    expect(body.items.length).toBe(123);
  });
});
