/*
 * This directory is not to import "@playwright/test" except its type information.
 *
 * When node_modules resolves "@playwright/test" in user's code and Echoed, it returns different instance sometimes.
 * In that case, Playwright raises an error saying "Requiring @playwright/test second time".
 * To avoid the error, this directory doesn't import "@playwright/test" but takes arguments which reference user's "@playwright/test" instance.
 *
 * c.f. https://github.com/microsoft/playwright/issues/24300#issuecomment-1641927651
 */

export { extendTest } from "@/integration/playwright/test/wrapper/fixture";
