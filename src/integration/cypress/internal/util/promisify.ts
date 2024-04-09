// Derived from https://github.com/NicholasBoll/cypress-promis
export function promisify<T>(chain: Cypress.Chainable<T>): Promise<T> {
  return new Cypress.Promise((resolve, reject) => {
    // We must subscribe to failures and bail. Without this, the Cypress runner would never stop
    Cypress.on("fail", rejectPromise);

    // unsubscribe from test failure on both success and failure. This cleanup is essential
    function resolvePromise(value: T): void {
      resolve(value);
      Cypress.off("fail", rejectPromise);
    }
    function rejectPromise(error: unknown): void {
      reject(error);
      Cypress.off("fail", rejectPromise);
    }

    chain.then(resolvePromise);
  });
}
