# Echoed with Playwright

This template provides a minimal setup to run Playwright after compiling YAML to Playwright tests by Echoed.
The example demonstrates tests written in YAML and TypeScript.

Feel free to remove the `example` directory once you've familiarized yourself and start crafting your own tests.

# How to Run Example Tests

Follow these steps to run the example tests in action:

1. **Setup:** Set up the necessary dependencies.
   ```sh
   npm install
   npx playwright install
   sudo npx playwright install-deps
   ```
2. **Start Server:** Navigate to the `example` directory and start the Dockerized server.
   ```sh
   cd example
   make start
   ```
3. **Open Website**: Check the server is running by opening http://localhost:8080 in your browser.
4. **Run Test:** In project's root directory, Run the tests after compiling YAML to Playwright tests.
   ```sh
   cd ../
   npm run compile && npm run test
   ```
5. **Stop Server:** After testing, stop the server in the `example` directory.
   ```sh
   cd example
   make stop
   ```
