Observable API testing library using OpenTelemetry for Jest.

# Tobikura

Tobikura empowers API testing by visualizing API traces and logs from OpenTelemetry.

# Installation

Choose one of the following methods to install Tobikura based on your testing needs:

## 1. Setup with example tests

1. Initialize a new directory using npx:
    ```
    mkdir my_test_directory && cd my_test_directory
    npx tobikura@latest
    ```
2. Review the example tests in the generated `README.md`:
    ```
    cat README.md
    ```
3. Once you're familiar, remove the `example` directory and begin crafting your own tests:
    ```
    npm run test
    ```

## 2. Integrate with existing tests

1. Modify `jest.config.js` to use Tobikura
    ```js
    module.exports = {
      // ... other configurations
      testEnvironment: "./__scripts/testEnvironment.ts", // Load the following testEnvironment.ts
      reporters: [
        "default",
        ["./__scripts/reporter.js", { output: "results/report.html" }],  // Load the following reporter.js
      ],
    };
    ```
2. Create `testEnvironment.ts`
    ```ts
    import {JestNodeEnvironment} from "tobikura";
    
    module.exports = JestNodeEnvironment;
    ```
3. Create `reporter.js`
    ```js
    const tobikura = require("tobikura");
    
    module.exports = tobikura.JestReporter;
    ```
4. Update your OpenTelemetry endpoint to use Tobikura:
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

