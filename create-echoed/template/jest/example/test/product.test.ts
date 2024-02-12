describe("/api/products/{id}", () => {
  it("should return a specified product", async () => {
    const response = await fetch(
      `http://localhost:8080/api/products/OLJCESPC7Z`,
    );
    expect(response.status).toBe(200);

    const jsonBody = await response.json();
    expect(jsonBody.id).toBe("OLJCESPC7Z");
  });
});
