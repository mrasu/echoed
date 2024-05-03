# Installation

Documentation for Installation of Echoed.

# Table of Contents

* [Jest](#Jest)
* [Playwright](#Playwright)
* [Cypress](#Cypress)

# Jest

Echoed offers two installation methods, choose one that suits your needs:

## Option 1. Create From Template

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
6. Stop server:
    ```bash
    cd example
    make stop
    ```
7. Once you're familiar, remove the `example` directory and begin crafting your own tests:
    ```bash
    rm -rf ./example
    ```

## Option 2. Integrate with Existing Tests

1. Install package:
    ```bash
    npm install echoed
    ```
2. Update Jest configuration for Echoed  
    Modify your `jest.config.js` to include Echoed in `testEnvironment` and `reporters`:
    ```js
    module.exports = {
      // ... other configurations
      testEnvironment: "echoed/jest/nodeEnvironment",
      reporters: [
        "default",
        "echoed/jest/reporter"
      ],
    };
    ```
3. Create `.echoed.yml`.  
    To integrate Echoed, create a configuration file named `.echoed.yml`.  
    The minimal required option is `output`, specifying where to write the result. Refer to the [Configuration](./configuration.md) for other options.  
    
    For example:
    ```yml
    output: "report/result.html"
    ```
4. Update your OpenTelemetry endpoint to send data to Echoed.  
    If you are using the OpenTelemetry Collector, modify its settings as shown below:
    ```yml
    exporters:
      otlphttp/local:
        endpoint: http://host.docker.internal:3000 # Default port of Echoed is 3000
    
    service:
      pipelines:
        traces:
          exporters: [otlphttp/local]
        logs:
          exporters: [otlphttp/local]
    ```

# Playwright

Echoed offers two installation methods, choose one that suits your needs:

## Option 1. Create From Template

1. Initialize a new directory using our Playwright template:
    ```bash
    mkdir my_test_directory && cd my_test_directory
    npm create echoed@latest -- --template playwright
    ```
2. Install dependencies:
    ```bash
    npm install
    npx playwright install
    sudo npx playwright install-deps
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
6. Stop server:
    ```bash
    cd example
    make stop
    ```
7. Once you're familiar, remove the `example` directory and begin crafting your own tests:
    ```bash
    rm -rf ./example
    ```

## Option 2. Integrate with Existing Tests

1. Install package:
    ```bash
    npm install echoed
    ```
2. Update Playwright configuration for Echoed  
    Modify your `playwright.config.ts` to include Echoed in `reporter` and `globalSetup`:
    ```js
    module.exports = {
      // ... other configurations
      reporter: [["html"], ["echoed/playwright/reporter"]],
      globalSetup: "echoed/playwright/globalSetup",
    };
    ```
3. Create `.echoed.yml`.  
    To integrate Echoed, create a configuration file named `.echoed.yml`.  
    The minimal required option is `output`, specifying where to write the result. Refer to the [Configuration](./configuration.md) for other options.  
    
    For example:
    ```yml
    output: "report/result.html"
    ```
4. Update your OpenTelemetry endpoint to send data to Echoed.  
    If you are using the OpenTelemetry Collector, modify its settings as shown below:
    ```yml
    exporters:
      otlphttp/local:
        endpoint: http://host.docker.internal:3000 # Default port of Echoed is 3000
    
    service:
      pipelines:
        traces:
          exporters: [otlphttp/local]
        logs:
          exporters: [otlphttp/local]
    ```

# Cypress

Echoed offers two installation methods, choose one that suits your needs:

## Option 1. Create From Template

1. Initialize a new directory using our Playwright template:
    ```bash
    mkdir my_test_directory && cd my_test_directory
    npm create echoed@latest -- --template cypress
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
4. Run test from project root directory:
    ```bash
    cd ../
    npm run test
    ```
5. After test, you can view the HTML report in `report/result.html` (specified in `.echoed.yml`):
    ```bash
    open report/result.html
    ```
6. Stop server:
    ```bash
    cd example
    make stop
    ```
7. Once you're familiar, remove the `example` and `cypress/e2e/example` directory and begin crafting your own tests:
    ```bash
    rm -rf ./example ./cypress/e2e/example
    ```

## Option 2. Integrate with Existing Tests

1. Install package:
    ```bash
    npm install echoed
    ```
2. Update Cypress configuration for Echoed  
    Modify your `cypress.config.ts` to include Echoed in `reporter` and `setupNodeEvents`:
    ```ts
    import { defineConfig } from "cypress";
    import { install } from "echoed/cypress/nodeEvents";
    
    module.exports = defineConfig({
      reporter: "echoed/cypressReporter.js", // <- Add reporter
      e2e: {
        setupNodeEvents: async (
          on: Cypress.PluginEvents,
          options: Cypress.PluginConfigOptions,
        ) => {
          return install(on, options);  // <- Run `install` to collect data for reporter
        },
      },
    });
    ```
3. Update Support file  
    Modify your `./cypress/support/e2e.js` to add commands by Echoed:
    ```ts
    import { install } from "echoed/cypress/support";
    
    install();
    ```
4. Create `.echoed.yml`.  
    To integrate Echoed, create a configuration file named `.echoed.yml`.  
    The minimal required option is `output`, specifying where to write the result. Refer to the [Configuration](./configuration.md) for other options.  
    
    For example:
    ```yml
    output: "report/result.html"
    ```
5. Update your OpenTelemetry endpoint to send data to Echoed.  
    If you are using the OpenTelemetry Collector, modify its settings as shown below:
    ```yml
    exporters:
      otlphttp/local:
        endpoint: http://host.docker.internal:3000 # Default port of Echoed is 3000
    
    service:
      pipelines:
        traces:
          exporters: [otlphttp/local]
        logs:
          exporters: [otlphttp/local]
    ```
