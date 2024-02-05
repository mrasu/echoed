import { createSession } from "../util/session";

describe("/api/recommendations", () => {
  const productId = "OLJCESPC7Z";

  it("should returns four recommended products", async () => {
    const session = createSession();
    const response = await fetch(
      `http://localhost:8080/api/recommendations?productIds=${productId}&sessionId=${session.userId}&currencyCode=${session.currencyCode}`,
    );
    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.length).toBe(4);
  });
});
