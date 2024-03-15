// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import crypto from "crypto";
import { CypressFields, getElementByField } from '../../utils/Cypress';

let traceIds: string[] = []

const generateTraceParent = () => {
  const traceId = crypto.randomBytes(16);
  const hexTraceId = traceId.toString("hex");
  const spanId = crypto.randomBytes(8).toString("hex");

  const traceparent = `00-${hexTraceId}-${spanId}-01`;

  return {traceparent, traceId: traceId.toString("base64")};
};

beforeEach(() => {
  cy.log("======beforeEach")
  traceIds = [];

  cy.intercept({method: "GET", path: "*"}, (req) => {
    const {traceparent, traceId} = generateTraceParent()
    traceIds.push(traceId)
    req.headers["traceparent"] = traceparent
  })
  cy.intercept({method: "POST", path: "*"}, (req) => {
    const {traceparent, traceId} = generateTraceParent()
    traceIds.push(traceId)
    req.headers["traceparent"] = traceparent
  })
})

afterEach(() => {
  cy.log("======afterEach")
  console.log(traceIds)
})

describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/cart*').as('addToCart');
    cy.intercept('GET', '/api/cart*').as('getCart');
    cy.intercept('POST', '/api/checkout*').as('placeOrder');
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('should create an order with two items', () => {
    // cy.wait(10000);

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
