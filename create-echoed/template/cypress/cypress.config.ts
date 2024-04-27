import { defineConfig } from "cypress";
import { install } from "echoed/cypress/nodeEvents";

module.exports = defineConfig({
  reporter: "echoed/cypressReporter.js",
  e2e: {
    setupNodeEvents: async (
      on: Cypress.PluginEvents,
      options: Cypress.PluginConfigOptions,
    ) => {
      return install(on, options);
    },
  },
});
