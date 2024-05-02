import {
  Assert,
  AssertSchema as CommonAssertSchema,
} from "@/scenario/compile/common/assert";
import { Config } from "@/scenario/compile/common/config";
import {
  AssertionShortcutSchema,
  isAssertionShortcutSchema,
  parseAssertionShortcutSchema,
} from "@/scenario/compile/playwright/assertionShortcut";
import { z } from "zod";

export const AssertSchema = z.union([
  CommonAssertSchema,
  AssertionShortcutSchema,
]);
export type AssertSchema = z.infer<typeof AssertSchema>;

export function parseAssert(config: Config, assert: AssertSchema): Assert {
  if (isAssertionShortcutSchema(assert)) {
    return new Assert(parseAssertionShortcutSchema(assert));
  }

  return Assert.parse(config, assert);
}
