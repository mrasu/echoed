# What is this directory?

This `example` directory serves as a reference implementation for running Tobikura tests.
For instance, `test/simple.test.ts` makes a request to http://localhost:8080/api/cart, and it asserts that the response returns with a status code of 200.

Feel free to remove this `example` directory once you are ready to create your own tests.

Note: The server utilizes a modified version of the code from [opentelemetry-demo](https://github.com/open-telemetry/opentelemetry-demo) which sends OpenTelemetry's data to `host.docker.internal:3000`, and it can be launched from DockerCompose.

## Usage

1. Start server: Move to `example` directory and start DockerCompose by `Make start`.
2. Run tests: Move to parent directory and execute `npm test` to run Jest with Tobikura.
3. Wait: Wait for the test to finish.
4. View results: Open `dist/reporter.html` to see the test results.
5. Stop server: Move to `example` directory and stop DockerCompose by `Make stop`.
