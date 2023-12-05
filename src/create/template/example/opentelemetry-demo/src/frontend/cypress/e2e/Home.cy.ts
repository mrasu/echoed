// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import getSymbolFromCurrency from 'currency-symbol-map';
import SessionGateway from '../../gateways/Session.gateway';
import { CypressFields, getElementByField } from '../../utils/Cypress';

import crypto from "crypto";

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


describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should validate the home page', () => {
    getElementByField(CypressFields.HomePage).should('exist');
    getElementByField(CypressFields.ProductCard, getElementByField(CypressFields.ProductList)).should('have.length', 10);

    getElementByField(CypressFields.SessionId).should('contain', SessionGateway.getSession().userId);
  });

  // it('should change currency', () => {
  //   getElementByField(CypressFields.CurrencySwitcher).select('EUR');
  //   getElementByField(CypressFields.ProductCard, getElementByField(CypressFields.ProductList)).should('have.length', 10);
//
  //   getElementByField(CypressFields.CurrencySwitcher).should('have.value', 'EUR');
//
  //   getElementByField(CypressFields.ProductCard).should('contain', getSymbolFromCurrency('EUR'));
  // });
});
