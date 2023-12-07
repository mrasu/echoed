describe("/api/products", () => {
  it("should return ten products", async () => {
    const response = await fetch(
      `http://localhost:8080/api/products?currencyCode=`,
    );
    expect(response.status).toBe(200);

    const jsonBody = await response.json();
    expect(jsonBody.length).toBe(10);
  });
});
