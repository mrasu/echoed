# Echoed with Jest

This template provides a minimal setup to get Echoed working with Jest without OpenTelemetry.
The setup also creates example tests to demonstrate Echoed's behavior.

Feel free to remove the `example` directory and edit `.echoed.yml` once you've familiarized yourself and start crafting your own tests.

# How to Run Example Tests

Follow these steps to run the example tests and observe Echoed in action:

1. **Setup:** Set up the necessary dependencies.
   ```sh
   npm install
   ```
2. **Start Server:** Navigate to the `example` directory and start the Dockerized server.
   ```sh
   cd example
   make start
   ```
3. **Open Website**: Check the server is running by opening http://localhost:8080 in your browser.
4. **Run Test:** In project's root directory, Run the tests after compiling to generate tests from yaml.
   ```sh
   cd ../
   npm run compile && npm run test
   ```
5. **Wait:** Allow the tests to run and complete.
6. **Stop Server:** After testing, stop the server in the `example` directory.
   ```sh
   cd example
   make stop
   ```
