# Tobikura: Observable Integration Testing using OpenTelemetry on top of Jest.

Tobikura empowers Integration testing, aka API testing, by providing visualizations of API traces and logs through OpenTelemetry.

# Features
Tobikura enhances your testing experience with the following features:

* **Effortless Test Troubleshooting**: Quickly identify issues in failed tests by visualizing OpenTelemetry's traces and logs.
* **Test Propagation Leak**: Identify spans that don't propagate OpenTelemetry's context to their children.
* **Validate Spans**: Test spans to validate SQL queries changing DB or requests going outside.
* **CI-Friendly**: Works seamlessly in CI environments without relying on external services.
* **IDE Debugging Support**: Debug your tests effortlessly in your preferred IDE, leveraging Jest's built-in debugging capabilities.
* **Code Compatibility**: No need to modify your existing Jest tests. Use your preferred JavaScript/TypeScript.
* **Parallel Execution**: Speed up test runs by executing tests in parallel with Jest.

# Screenshots

Tobikura generates HTML that visualizes OpenTelemetry traces for each request in Jest tests.  
Explore the screenshots below to see how it looks:

* List of executed tests  
    ![Screenshot of Tobikura's test list](./docs/img/readme-test-list.png)
* Detail result  
    ![Screenshot of Tobikura's test results](./docs/img/readme-test-detail.png)
* Trace and logs of the Test  
    ![Screenshot of Tobikura's log detail](./docs/img/readme-trace-detail-trace.png)
    ![Screenshot of Tobikura's log detail](./docs/img/readme-trace-detail-log.png)


# Installation

Tobikura offers two installation methods, allowing you to choose the one that suits your needs:

## 1. Create a New Directory with Example Tests

1. Initialize a new directory using npx:
    ```bash
    mkdir my_test_directory && cd my_test_directory
    npx tobikura@latest
    ```
2. Review the example tests and run them by following instructions in the generated `README.md`:
    ```bash
    cat README.md
    ```
3. Once you're familiar, remove the `example` directory and begin crafting your own tests:
    ```bash
    npm run test
    ```

## 2. Integrate with Existing Tests

1. Modify `jest.config.js` to use Tobikura
    ```js
    module.exports = {
      // ... other configurations
      testEnvironment: "tobikura/jest/nodeEnvironment",
      reporters: [
        "default",
        ["tobikura/jest/reporter", { output: "results/report.html" }],
      ],
    };
    ```
2. Update your OpenTelemetry endpoint to connect to Tobikura.  
    If you are using the OpenTelemetry Collector, modify its settings as shown below:
    ```yml
    exporters:
      otlphttp/local:
        endpoint: http://host.docker.internal:3000 # Default port of Tobikura's server
    
    service:
      pipelines:
        traces:
          exporters: [otlphttp/local]
        logs:
          exporters: [otlphttp/local]
    ```

# How to Use

## Make Tests Observable

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

## Test OpenTelemetry's Spans

In addition to the HTML output, Tobikura offers a convenient method for testing OpenTelemetry spans.  
Use the `waitForSpan` function to obtain a span that matches your criteria.

```ts
describe("Awesome test", () => {
  it("should create an OpenTelemetry span", async () => {
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
