import { BASE_URL } from "@/example/util/const";
import { getSession } from "@/example/util/session";

describe("Home Page", { baseUrl: BASE_URL }, () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should validate the home page", () => {
    cy.get("[data-cy=home-page]").should("be.visible");
    cy.get("[data-cy=product-list] [data-cy=product-card]").should(
      "have.length",
      10,
    );

    getSession().then(({ userId, currencyCode }) => {
      cy.get("[data-cy=session-id]").should("contain.text", userId);
    });
  });

  it("should change currency", () => {
    cy.get("[data-cy=currency-switcher]").select("EUR");
    cy.get("[data-cy=product-list] [data-cy=product-card]").should(
      "have.length",
      10,
    );
    cy.get("[data-cy=product-card]").first().should("contain.text", "€");
  });
});
