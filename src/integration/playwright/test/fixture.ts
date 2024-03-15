import { extendTest } from "@/integration/playwright/test/wrapper/fixture";
import { test as playwrightTest } from "@playwright/test";

export const test = extendTest(playwrightTest);
