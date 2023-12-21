Observable API testing library using OpenTelemetry for Jest.

# Tobikura

Tobikura empowers API testing by visualizing API traces and logs from OpenTelemetry.

# Screenshots

Tobikura generates an HTML report for Jest results.  
See below for screenshots of the report:

* Executed Tests List  
    ![Screenshot of Tobikura's test list](./docs/img/readme-test-list.png)
* Test result page  
    ![Screenshot of Tobikura's test results](./docs/img/readme-test-detail.png)
* Trace of the Test  
    ![Screenshot of Tobikura's log detail](./docs/img/readme-trace-detail-trace.png)
* Logs for the Trace of the Test  
    ![Screenshot of Tobikura's log detail](./docs/img/readme-trace-detail-log.png)


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
      testEnvironment: "tobikura/jest/nodeEnvironment",
      reporters: [
        "default",
        ["tobikura/jest/reporter", { output: "results/report.html" }],
      ],
    };
    ```
2. Update your OpenTelemetry endpoint to use Tobikura:
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

