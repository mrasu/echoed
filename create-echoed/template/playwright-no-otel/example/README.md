# What is this directory?

This `example` directory serves as a reference implementation for running Echoed's tests.
For instance, `test/scenario/home.yaml` visits http://localhost:8080, and it asserts that the page contains expected DOM elements.

Feel free to remove this `example` directory once you are ready to create your own tests.

## Usage

1. Start server: Move to `example` directory and start DockerCompose by `make start`.
2. Run tests: Move to parent directory and execute `npm run compile` to create tests from YAMLs and `npm run test` to run Playwright.
3. Stop server: Move to `example` directory and stop DockerCompose by `make stop`.

Note: The server utilizes a modified version of the code from [opentelemetry-demo](https://github.com/open-telemetry/opentelemetry-demo) which sends OpenTelemetry's data to `host.docker.internal:3000`, and it can be launched from DockerCompose.
