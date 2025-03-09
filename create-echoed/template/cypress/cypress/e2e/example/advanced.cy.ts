const SPAN_FILTER = {
  name: "oteldemo.ProductCatalogService/ListProducts",
  resource: {
    attributes: {
      "service.name": "product-catalog",
    },
  },
  attributes: {
    "rpc.method": "ListProducts",
  },
};

it("should open page", () => {
  cy.visit("http://localhost:8080/");
  cy.title().should("eq", "OTel demo");

  cy.get("[data-cy=product-card]").should("have.length", 10);
  cy.waitForSpan(/api\/products/, SPAN_FILTER).then((span) => {
    const rpcSystem = span.attributes.find(
      (attr) => attr.key === "app.products.count",
    );
    expect(rpcSystem?.value?.intValue).to.eq(10);
  });
});

it("should create Span with cy.request", () => {
  cy.request(`http://localhost:8080/api/products`).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.length).to.eq(10);

    cy.waitForSpan(response, SPAN_FILTER).then((span) => {
      const rpcSystem = span.attributes.find(
        (attr) => attr.key === "app.products.count",
      );
      expect(rpcSystem?.value?.intValue).to.eq(10);
    });
  });
});
