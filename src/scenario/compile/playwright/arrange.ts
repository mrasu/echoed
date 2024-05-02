import {
  Arrange,
  ArrangeSchema as CommonArrangeSchema,
} from "@/scenario/compile/common/arrange";
import { Config } from "@/scenario/compile/common/config";
import {
  AssertionShortcutSchema,
  isAssertionShortcutSchema,
  parseAssertionShortcutSchema,
} from "@/scenario/compile/playwright/assertionShortcut";
import { z } from "zod";

export const ArrangeSchema = z.union([
  CommonArrangeSchema,
  AssertionShortcutSchema,
]);
export type ArrangeSchema = z.infer<typeof ArrangeSchema>;

export function parseArrange(config: Config, arrange: ArrangeSchema): Arrange {
  if (isAssertionShortcutSchema(arrange)) {
    return new Arrange(parseAssertionShortcutSchema(arrange));
  }

  return Arrange.parse(config, arrange);
}
