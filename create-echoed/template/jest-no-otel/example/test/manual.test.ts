import { createSession } from "../util/session";

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
});
