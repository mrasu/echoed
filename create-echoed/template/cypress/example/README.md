# What is this directory?

This `example` directory and `cypress/e2e/example` directory serve as a reference implementation for running Echoed's tests.
For instance, `cypress/e2e/example/home.cy.ts` visits http://localhost:8080, and it asserts that the page contains expected DOM elements.

Feel free to remove this `example` directory and `cypress/e2e/example` directory once you are ready to create your own tests.

## Usage

1. Start server: Move to `example` directory and start DockerCompose by `make start`.
2. Run tests: Move to parent directory and execute `npm run test` to run Cypress with Echoed.
3. Wait: Wait for the test to finish.
4. View results: Open `report/result.html` to see the test results.
5. Stop server: Move to `example` directory and stop DockerCompose by `make stop`.

6. Note: The server utilizes a modified version of the code from [opentelemetry-demo](https://github.com/open-telemetry/opentelemetry-demo) which sends OpenTelemetry's data to `host.docker.internal:3000`, and it can be launched from DockerCompose.
