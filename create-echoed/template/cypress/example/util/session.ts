import { LOCALSTORAGE_ORIGIN } from "@/example/util/const";

export function getSession(): Cypress.Chainable<{
  userId: string | undefined;
  currencyCode: string | undefined;
}> {
  return cy.getAllLocalStorage().then((result) => {
    const sessionId = result[LOCALSTORAGE_ORIGIN].session;
    if (sessionId && typeof sessionId === "string") {
      const { userId, currencyCode } = JSON.parse(sessionId);
      return { userId: userId, currencyCode: currencyCode };
    }

    return { userId: undefined, currencyCode: undefined };
  });
}
