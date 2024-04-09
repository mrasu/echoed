# How to Use

Documentation for Usage of Echoed.

# Table of contents

* [Jest](#Jest)
* [Playwright](#Playwright)
* [Cypress](#Cypress)
* [Analyze Coverage](#Analyze-Coverage)
* [Using Echoed without OpenTelemetry](#Using-Echoed-without-OpenTelemetry)

# Jest

## YAML

You can write tests using YAML, and Echoed will convert them into Jest tests.  
![Compilation flow](https://github.com/mrasu/echoed/raw/main/docs/img/scenarioYamlCompile.jpg)

### Create Observable Tests

The YAML below makes a request to `http://localhost:8080/api/cart` and validates the response.

```yaml
variable:
  productId: OLJCESPC7Z
scenarios:
  - name: Get product detail
    steps:
      - description: fetch /products/{id}
        act:
          runner: fetch
          argument:
            endpoint: /products/${productId}
        assert:
          - expect(_.jsonBody.id).toBe(productId)
```

To execute the test, use the command `npx echoed compile` to transform the YAML into TypeScript, and then run Jest

### Configuration

To configure runners and adjust other options, include `scenario` block in the `.echoed.yml` file, like below:

```yaml
scenario:
  compile:
    env:
      BASE_ENDPOINT: http://localhost:8080
    plugin:
      runner:
        - name: fetch
          module: echoed/scenario/gen/jest/runner
          option:
            baseEndpoint: ${_env.BASE_ENDPOINT}/api
            headers:
              content-type: application/json
```

For more details, refer to the [YAML documentation](/docs/yamlScenario.md).  

## TypeScript

You can write tests in TypeScript too.

### Make Tests Observable

To generate an HTML report visualizing API traces, no additional code is needed.  
Simply write your Jest tests as usual.

```ts
describe("Awesome test", () => {
  it("should pass", async () => {
    const response = await fetch(`http://localhost:8080/api/cart`);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.items.length).toBe(0);
  });
});
```
The code above produces an HTML report illustrating a trace for the requested endpoint (`http://localhost:8080/api/cart`).

### Test OpenTelemetry's Spans

In addition to the HTML output, Echoed offers a method for testing OpenTelemetry spans.  
Use the `waitForSpan` function to obtain a span that matches your needs.

```ts
describe("Awesome test", () => {
  it("should create an OpenTelemetry gRPC span", async () => {
    const response = await fetch(`http://localhost:8080/api/products`);
    expect(response.status).toBe(200);

    const span = await waitForSpan(response, {
      name: "oteldemo.ProductCatalogService/ListProducts",
      resource: {
        attributes: {
          "service.name": "productcatalogservice",
        },
      },
      attributes: {
        "app.products.count": gte(5),
        "rpc.system": /grpc/,
      }
    });
    
    const productsCount = span.attributes.find(attr => attr.key === "app.products.count");
    expect(productsCount?.value?.intValue).toBe(10);
  });
});
```
The code above waits for a span that satisfies the following specified conditions and then compares it using the `expect` statement:
* `name` is `oteldemo.ProductCatalogService/ListProducts`
* `service.name` in resource is `productcatalogservice`
* `app.products.count` attribute is greater than or equal to `5`
* `rpc.system` attribute matches `/grpc/`

### Test SQL

You can use the `waitForSpan` function to test executed SQL too.

```ts
describe("Awesome test", () => {
  it("should create an OpenTelemetry span", async () => {
    const response = await fetch(`http://localhost:8080/api/products`, {
      method: "POST",
      body: JSON.stringify({
          name: "Awesome Product",
          price: 100,
      }),
    });
    expect(response.status).toBe(200);

    const span = await waitForSpan(response, {
      name: "oteldemo.ProductCatalogService/CreateProducts",
      resource: {
        attributes: {
          "service.name": "productcatalogservice",
        },
      },
      attributes: {
        "db.system": "postgresql",
        "db.statement": /INSERT INTO products +/,
      }
    });
    
    const query = span.attributes.find(attr => attr.key === "db.statement");
    expect(query?.value?.stringValue).toBe("INSERT INTO products (name, price) VALUES ('Awesome Product', 100)");
  });
});
```

## More Examples

For more examples, refer to [jest/example/test](../create-echoed/template/jest/example/test) directory.

# Playwright

### Make Tests Observable

To generate an HTML report visualizing API traces, replace `test` of Playwright to Echoed's to intercept requests.
For instance, you can use `test` as below:

```ts
// import { test } from "@playwright/test"; <- Replace this line
import { test } from "echoed/playwright/test";

test("opens home page", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await expect(page).toHaveTitle("OTel demo");

  const productList = page.locator("[data-cy=product-card]");
  await expect(productList).toHaveCount(10);
});
```
The code above produces an HTML report illustrating traces made when opening the home page(`http://localhost:8080`).

### Test OpenTelemetry's Spans

In addition to the HTML output, Echoed offers a method for testing OpenTelemetry spans.  
Use the `waitForSpanCreatedIn` function to obtain a span that matches your needs.

```ts
test("creates an OpenTelemetry gRPC span", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await expect(page).toHaveTitle("OTel demo");

  const span = await waitForSpanCreatedIn(
    page.context(),
    "http://localhost:8080/api/products",
    {
      name: "oteldemo.ProductCatalogService/ListProducts",
      resource: {
        attributes: {
          "service.name": "productcatalogservice",
        },
      },
      attributes: {
        "app.products.count": gte(5),
        "rpc.system": /grpc/,
      }
    },
  );
  
  const rpcSystem = span.attributes.find(
    (attr) => attr.key === "app.products.count",
  );
  expect(rpcSystem?.value?.intValue).toBe(10);
});
```
The code above waits for a span that satisfies the following specified conditions and then compares it using the `expect` statement:
* `name` is `oteldemo.ProductCatalogService/ListProducts`
* `service.name` in resource is `productcatalogservice`
* `app.products.count` attribute is greater than or equal to `5`
* `rpc.system` attribute matches `/grpc/`

You can also use `waitForSpan` family functions to test OpenTelemetry spans with the almost same way.

* **waitForSpan** is for `fetch` (`globalThis.fetch`)
* **waitForSpanFromPlaywrightFetch** is for `context.request.get` or `request.get`
* (**waitForSpanCreatedIn** is for traces created in `context`)

### Test SQL

You can use the `waitForSpan` function to test executed SQL too.

```ts
test("creates an OpenTelemetry span", async ({ request }) => {
  const response = await request.post(`http://localhost:8080/api/products`, {
    data: {
        name: "Awesome Product",
        price: 100,
    },
  });
  expect(response.status()).toBe(200);

  const span = await waitForSpanFromPlaywrightFetch(response, {
    name: "oteldemo.ProductCatalogService/CreateProducts",
    resource: {
      attributes: {
        "service.name": "productcatalogservice",
      },
    },
    attributes: {
      "db.system": "postgresql",
      "db.statement": /INSERT INTO products +/,
    }
  });

  const query = span.attributes.find(attr => attr.key === "db.statement");
  expect(query?.value?.stringValue).toBe("INSERT INTO products (name, price) VALUES ('Awesome Product', 100)");
});
```

## YAML

YAML is under development. 🚧

## More Examples

For more examples, refer to [playwright/example/test](../create-echoed/template/playwright/example/test) directory.

# Cypress

### Make Tests Observable

To generate an HTML report visualizing API traces, no additional code is needed.  
Simply write your Cypress tests as usual.

```ts
it("opens home page", () => {
  cy.visit("http://localhost:8080");
  cy.title().should("eq", "OTel demo");
  
  cy.get("[data-cy=product-card]").should("have.length", 10);
});
```
The code above produces an HTML report illustrating traces made when opening the home page(`http://localhost:8080`).

### Test OpenTelemetry's Spans

In addition to the HTML output, Echoed offers a method for testing OpenTelemetry spans.  
Use the `waitForSpan` command to obtain a span that matches your needs.

```ts
it("creates an OpenTelemetry gRPC span", () => {
  cy.visit("http://localhost:8080");
  cy.title().should("eq", "OTel demo");

  cy.waitForSpan(
    "http://localhost:8080/api/products",
    {
      name: "oteldemo.ProductCatalogService/ListProducts",
      resource: {
        attributes: {
          "service.name": "productcatalogservice",
        },
      },
      attributes: {
        "app.products.count": gte(5),
        "rpc.system": /grpc/,
      }
    },
  ).then((span) => {
    const rpcSystem = span.attributes.find(
      (attr) => attr.key === "app.products.count",
    );
    expect(rpcSystem?.value?.intValue).to.eq(10);
  });
});
```
The code above waits for a span that satisfies the following specified conditions and then compares it using the `expect` statement:
* `name` is `oteldemo.ProductCatalogService/ListProducts`
* `service.name` in resource is `productcatalogservice`
* `app.products.count` attribute is greater than or equal to `5`
* `rpc.system` attribute matches `/grpc/`

You can also use `waitForSpan` command to test the response of `cy.request()` by replacing the url in arguments with the response of `cy.request()`.

### Test SQL

You can use the `waitForSpan` command to test executed SQL too.

```ts
it("creates an OpenTelemetry span", () => {
  cy.request("POST", `http://localhost:8080/api/products`, {
    data: {
        name: "Awesome Product",
        price: 100,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    
    cy.waitForSpan(response, {
      name: "oteldemo.ProductCatalogService/CreateProducts",
      resource: {
        attributes: {
          "service.name": "productcatalogservice",
        },
      },
      attributes: {
        "db.system": "postgresql",
        "db.statement": /INSERT INTO products +/,
      }
    }).then((span) => {
      const query = span.attributes.find(attr => attr.key === "db.statement");
      expect(query?.value?.stringValue).to.eq("INSERT INTO products (name, price) VALUES ('Awesome Product', 100)");
    });
  });
});
```

## YAML

YAML is under development. 🚧

## More Examples

For more examples, refer to [cypress/example/test](../create-echoed/template/cypress/cypress/e2e/example) directory.

# Analyze Coverage

You can get coverage of your HTTP and gRPC endpoints based on OpenAPI or Protocol Buffers specifications.  
By configuring the `openapi` or `proto` option in your `.echoed.yml` file, Echoed analyzes the coverage of your tests and generates a report.  
For more option, refer to the [Configuration](./configuration.md).  

```yaml
services:
  - name: frontend
    namespace: opentelemetry-demo
    openapi: "./example/opentelemetry-demo/src/frontend/schema.yaml"
  - name: cartservice
    namespace: opentelemetry-demo
    proto:
      filePath: "./example/opentelemetry-demo/pb/demo.proto"
      services:
        - oteldemo.CartService
```

# Using Echoed without OpenTelemetry

While Echoed's primary feature is to troubleshoot or analyze tests by visualizing OpenTelemetry data, it can also be used to write Jest tests in YAML.  
To add Echoed into existing tests for writing tests in YAML, simply create a `.echoed.yml` file for configuration.  
In the "Installation" section, you may see `nodeEnvironment` and `reporter` is added in `jest.config.js`. However, because these configurations are to collect OpenTelemetry data, when you don't use OpenTelemetry, there's no need to modify it.

Alternatively, if you wish to create example tests without OpenTelemetry, you can do so using the following commands:
```bash
# Create example tests
npm create echoed@latest -- --template jest-no-otel

# Compile YAML to TypeScript and run tests
npx echoed compile
npx jest
```
