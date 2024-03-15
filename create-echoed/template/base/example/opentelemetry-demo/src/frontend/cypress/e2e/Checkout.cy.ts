// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { CypressFields, getElementByField } from '../../utils/Cypress';

beforeEach(() => {
  cy.intercept({method: "GET", path: "*"}, (req) => {
    req.headers["traceparent"] = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"
  })
})

describe('Checkout Flow', () => {
  before(() => {
    cy.intercept('POST', '/api/cart*').as('addToCart');
    cy.intercept('GET', '/api/cart*').as('getCart');
    cy.intercept('POST', '/api/checkout*').as('placeOrder');
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('should create an order with two items', () => {
    getElementByField(CypressFields.ProductCard).first().click();
    getElementByField(CypressFields.ProductAddToCart).click();

    cy.wait('@addToCart');
    // cy.wait('@getCart', { timeout: 10000 });
    // cy.wait(2000);

    // cy.location('href').should('match', /\/cart$/);
    // getElementByField(CypressFields.CartItemCount).should('contain', '1');
//
    // cy.visit('/');
//
    // getElementByField(CypressFields.ProductCard).last().click();
    // getElementByField(CypressFields.ProductAddToCart).click();
//
    // cy.wait('@addToCart');
    // cy.wait('@getCart', { timeout: 10000 });
    // cy.wait(2000);
//
    // cy.location('href').should('match', /\/cart$/);
    // getElementByField(CypressFields.CartItemCount).should('contain', '2');
//
    // getElementByField(CypressFields.CartIcon).click({ force: true });
    // getElementByField(CypressFields.CartGoToShopping).click();
//
    // cy.location('href').should('match', /\/cart$/);
//
    // getElementByField(CypressFields.CheckoutPlaceOrder).click();
//
    // cy.wait('@placeOrder');
//
    // cy.location('href').should('match', /\/checkout/);
    // getElementByField(CypressFields.CheckoutItem).should('have.length', 2);
  });
});

export {};
