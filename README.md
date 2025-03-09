<div align="center">

<img src="https://github.com/mrasu/echoed/raw/main/docs/img/logo.svg" alt="echoed logo" height="300"/>

# Echoed

#### Observable Integration Testing using OpenTelemetry on top of Jest/Playwright/Cypress.

</div>

# Table of Contents

* [Features](#Features)
* [How Echoed Works](#How-Echoed-Works)
* [Screenshots](#Screenshots)
* [Installation](#Installation)
* [How to Use](#How-to-Use)
  * [Jest](#Jest)
  * [Playwright](#Playwright)
  * [Cypress](#Cypress)
  * [Analyze Coverage](#Analyze-Coverage)
* [Using Echoed without OpenTelemetry](#Using-Echoed-without-OpenTelemetry)
* [Configuration](#Configuration)

# Features
Echoed enhances Integration testing, aka API testing with the following features:

* **Effortless Test Troubleshooting**: Quickly identify issues in failed tests by visualizing OpenTelemetry's traces and logs.
* **YAML Supported**: Write tests effortlessly using YAML and easily expand functionality through your plugins.
* **Coverage Analysis**: Gain insights into the coverage of your API endpoints based on OpenAPI or Protocol Buffers specifications.
* **Detect Propagation Leaks**: Uncover spans that don't propagate OpenTelemetry's context to their children.
* **Validate Spans**: Validate span's fields, such as SQL or requests going outside.
* **CI-Friendly**: Integrates with CI without relying on external services.
* **IDE Debugging**: Debug your tests in your preferred IDE, leveraging TypeScript/JavaScript's built-in debugging capabilities.
* **Code Compatibility**: No need to modify your existing tests.
* **Parallel Execution**: Boost by executing tests in parallel.

# How Echoed Works

Echoed starts a local server to gather data through OpenTelemetry when test is started.  
Throughout the testing process, Echoed captures OpenTelemetry's traces and logs.  
Once tests finish, Echoed generates an HTML report for the test.

![How Echoed Works](https://github.com/mrasu/echoed/raw/main/docs/img/howEchoedWorks.png)

# Screenshots

Echoed generates HTML that visualizes OpenTelemetry traces for each request in tests.  
Explore the screenshots below to see how it looks:

* Trace and logs of the Test  
    ![Screenshot of Echoed's log detail](https://github.com/mrasu/echoed/raw/main/docs/img/readmeTraceDetailTrace.png)
    ![Screenshot of Echoed's log detail](https://github.com/mrasu/echoed/raw/main/docs/img/readmeTraceDetailLog.png)
* Coverage per service  
    ![Screenshot of Echoed's coverage](https://github.com/mrasu/echoed/raw/main/docs/img/readmeCoverage.png)

# Installation

Echoed offers several installation methods depending on your needs:

## Option 1. Create From Template (Jest)

1. Initialize a new directory using our template:
    ```bash
    mkdir my_test_directory && cd my_test_directory
    npm create echoed@latest
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start server in the `example` directory:
    ```bash
    cd example
    make start
    ```
4. Run test from project root directory after compiling YAML tests:
    ```bash
    cd ../
    npm run compile && npm run test
    ```
5. After test, you can view the HTML report in `report/result.html` (specified in `.echoed.yml`):
    ```bash
    open report/result.html
    ```

## Other Options

Refer to the following documents for other installation methods:
* [Jest](./docs/installation.md#jest)
* [Playwright](./docs/installation.md#playwright)
* [Cypress](./docs/installation.md#cypress)

# How to Use

## Jest

### YAML

You can write tests using YAML, and Echoed will convert them into Jest tests.  
![Compilation flow](https://github.com/mrasu/echoed/raw/main/docs/img/scenarioYamlCompile.jpg)

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

For more details, refer to the [documentation](./docs/yamlJestScenario.md) or [examples](create-echoed/template/jest/example/scenario).  

### Make Tests Observable

You can write Jest tests in TypeScript too.

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
    });
    
    const productsCount = span.attributes.find(attr => attr.key === "app.products.count");
    expect(productsCount?.value?.intValue).toBe(10);
  });
});
```
The code above waits for a span and compares it using the `expect` statement

### Other Examples

For more examples, refer to [documentation](./docs/howToUse.md#jest).

## Playwright

You can write Playwright tests in TypeScript too.

### YAML

You can write tests using YAML, and Echoed will convert them into Playwright tests.  

![Compilation flow](https://github.com/mrasu/echoed/raw/main/docs/img/scenarioYamlToPlaywright.png)

The YAML below opens `http://localhost:8080` and validates DOM elements.

```yaml
scenarios:
  - name: Validate Homepage
    fixtures:
      - page
    steps:
      - description: Check product list is shown
        act:
          raw: await page.goto("http://localhost:8080")
        assert:
          - expectToBeVisible: "[data-cy=home-page]"
          - expectToHaveCount:
              selector: "[data-cy=product-list] [data-cy=product-card]"
              count: 10
```

For more details, refer to the [documentation](./docs/yamlPlaywrightScenario.md) or [examples](create-echoed/template/playwright/example/test/scenario). 

### Make Tests Observable

You can write Playwright tests in TypeScript too.

To generate an HTML report visualizing API traces, replace `test` of Playwright to Echoed's to intercept requests.

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

The code above produces an HTML report illustrating traces when opening the home page(`http://localhost:8080`).

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
    { name: "oteldemo.ProductCatalogService/ListProducts" },
  );
  
  const rpcSystem = span.attributes.find(
    (attr) => attr.key === "app.products.count",
  );
  expect(rpcSystem?.value?.intValue).toBe(10);
});
```
The code above waits for a span that links to the request to `http://localhost:8080/api/products` and compares it using the `expect` statement

### Other Examples

For more examples, refer to [documentation](./docs/howToUse.md#playwright).

## Cypress

You can write Cypress tests in TypeScript too.

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

The code above produces an HTML report illustrating traces when opening the home page(`http://localhost:8080`).

### Test OpenTelemetry's Spans

In addition to the HTML output, Echoed offers a method for testing OpenTelemetry spans.  
Use the `waitForSpan` command to obtain a span that matches your needs.

```ts
it("creates an OpenTelemetry gRPC span", () => {
  cy.visit("http://localhost:8080");
  cy.title().should("eq", "OTel demo");

  cy.waitForSpan(
    "http://localhost:8080/api/products",
    { name: "oteldemo.ProductCatalogService/ListProducts" },
  ).then((span) => {
    const rpcSystem = span.attributes.find(
      (attr) => attr.key === "app.products.count",
    );
    expect(rpcSystem?.value?.intValue).to.eq(10);
  });
});
```
The code above waits for a span that links to the request to `http://localhost:8080/api/products` and compares it using the `expect` statement

### Other Examples

For more examples, refer to [documentation](./docs/howToUse.md#cypress).

## Analyze Coverage

You can get coverage of your HTTP and gRPC endpoints based on OpenAPI or Protocol Buffers specifications.  
By configuring the `openapi` or `proto` option in your `.echoed.yml` file, Echoed analyzes the coverage of your tests and generates a report.  
For more option, refer to the [Configuration](#Configuration) section.  

```yaml
services:
  - name: frontend
    namespace: opentelemetry-demo
    openapi: "./example/echoed-opentelemetry-demo/src/frontend/schema.yaml"
  - name: cartservice
    namespace: opentelemetry-demo
    proto:
      filePath: "./example/echoed-opentelemetry-demo/pb/demo.proto"
      services:
        - oteldemo.CartService
```

# Using Echoed without OpenTelemetry

While Echoed's primary feature is to troubleshoot or analyze tests by visualizing OpenTelemetry data, it can also be used to write tests in YAML.  
To add YAML tests into existing tests, simply create a `.echoed.yml` file for configuration and run `npx echoed compile`.  

Alternatively, if you wish to create example tests without OpenTelemetry, you can do so using the following commands:
```bash
# Create example tests
npm create echoed@latest -- --template jest-no-otel

# Compile YAML to TypeScript and run tests
npx echoed compile
npx jest
```

Or for Playwright:
```bash
# Create example tests
npm create echoed@latest -- --template playwright-no-otel

# Compile YAML to TypeScript and run tests
npx echoed compile
npx playwright test
```

# Configuration

Echoed can be configured at `.echoed.yml` in the root of your project.  
Explore available options [here](./src/schema/configSchema.ts).
