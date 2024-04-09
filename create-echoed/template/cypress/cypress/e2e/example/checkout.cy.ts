import { BASE_URL } from "@/example/util/const";

describe("Checkout Flow", { baseUrl: BASE_URL }, () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should create an order with two items", () => {
    cy.get("[data-cy=product-card]").first().click();
    cy.get("[data-cy=product-add-to-cart]").click();

    cy.url().should("match", /\/cart$/);
    cy.get("[data-cy=cart-item-count]").should("contain.text", "1");

    cy.visit("/");
    cy.get("[data-cy=product-card]").last().click();
    cy.get("[data-cy=product-add-to-cart]").click();
    cy.url().should("match", /\/cart$/);
    cy.get("[data-cy=cart-item-count]").should("contain.text", "2");

    cy.get("[data-cy=cart-icon]").click();
    cy.get("[data-cy=cart-go-to-shopping]").click();
    cy.url().should("match", /\/cart$/);

    cy.get("[data-cy=checkout-place-order]").click();
    cy.url().should("match", /\/checkout/);

    cy.get("[data-cy=checkout-item]").should("have.length", 2);

    cy.waitForSpan(/api\/checkout/, {
      name: "grpc.oteldemo.PaymentService/Charge",
      resource: {
        attributes: {
          "service.name": "paymentservice",
        },
      },
      attributes: {
        "rpc.method": "Charge",
      },
    }).then((span) => {
      const amountAttribute = span.attributes.find(
        (attr) => attr.key === "app.payment.amount",
      );
      expect(amountAttribute?.value?.doubleValue).to.eq(120.749999999);
    });
  });
});
