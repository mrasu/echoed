import { test as base } from "@playwright/test";
import { extendTest } from "echoed/playwright/test/wrapper";

export const test = extendTest(base);
