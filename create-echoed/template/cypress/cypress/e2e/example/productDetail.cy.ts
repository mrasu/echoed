import { BASE_URL } from "@/example/util/const";

describe("Product Detail Page", { baseUrl: BASE_URL }, () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should validate the product detail page", () => {
    cy.get("[data-cy=product-card]").first().click();
    cy.get("[data-cy=product-detail]").should("be.visible");
    cy.get("[data-cy=product-picture]").should("be.visible");
    cy.get("[data-cy=product-name]").should("be.visible");
    cy.get("[data-cy=product-description]").should("be.visible");
    cy.get("[data-cy=product-add-to-cart]").should("be.visible");
    cy.get("[data-cy=recommendation-list] [data-cy=product-card]").should(
      "have.length",
      4,
    );
    cy.get("[data-cy=ad]").should("be.visible");
  });

  it("should add item to cart", () => {
    cy.get("[data-cy=product-card]").first().click();
    cy.get("[data-cy=product-add-to-cart]").click();

    cy.url().should("match", /\/cart$/);

    cy.get("[data-cy=cart-item-count]").should("have.length", 1);
    cy.get("[data-cy=cart-icon]").click();

    cy.get("[data-cy=cart-dropdown-item]").should("have.length", 1);
  });
});
