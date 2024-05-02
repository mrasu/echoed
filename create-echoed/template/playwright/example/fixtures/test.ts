import { test as base } from "@playwright/test";
import { extendTest } from "echoed/playwright/test/wrapper";

/**
 * Use `extendTest` when not possible to use `test` of `echoed/playwright/test` directly.
 */
export const test = extendTest(base);
