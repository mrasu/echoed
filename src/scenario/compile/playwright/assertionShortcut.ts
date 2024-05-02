import { TsString } from "@/scenario/compile/common/tsString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { LocatorAssertionString } from "@/scenario/compile/playwright/locatorAssertionString";
import { PageAssertionString } from "@/scenario/compile/playwright/pageAssertionString";
import { JsonSchema } from "@/type/jsonZod";
import { neverVisit } from "@/util/never";
import { z } from "zod";

const defaultLocatorOptionSchema = z.strictObject({
  selector: z.string(),
  timeout: z.number().optional(),
  not: z.boolean().optional(),
});
const defaultPageOptionSchema = z.strictObject({
  timeout: z.number().optional(),
  not: z.boolean().optional(),
});
const stringOrArraySchema = z.string().or(z.array(z.string()));

export const AssertionShortcutSchema = z.union([
  z.strictObject({
    expectToBeAttached: z.string().or(
      z
        .strictObject({
          attached: z.boolean().optional(),
        })
        .merge(defaultLocatorOptionSchema),
    ),
  }),
  z.strictObject({
    expectToBeChecked: z.string().or(
      z
        .strictObject({
          checked: z.boolean().optional(),
        })
        .merge(defaultLocatorOptionSchema),
    ),
  }),
  z.strictObject({
    expectToBeDisabled: z.string().or(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToBeEditable: z
      .string()
      .or(
        z
          .strictObject({ editable: z.boolean().optional() })
          .merge(defaultLocatorOptionSchema),
      ),
  }),
  z.strictObject({
    expectToBeEmpty: z.string().or(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToBeEnabled: z
      .string()
      .or(
        z
          .strictObject({ enabled: z.boolean().optional() })
          .merge(defaultLocatorOptionSchema),
      ),
  }),
  z.strictObject({
    expectToBeFocused: z.string().or(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToBeHidden: z.string().or(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToBeInViewport: z
      .string()
      .or(
        z
          .strictObject({ ratio: z.number().optional() })
          .merge(defaultLocatorOptionSchema),
      ),
  }),
  z.strictObject({
    expectToBeVisible: z
      .string()
      .or(
        z
          .strictObject({ visible: z.boolean().optional() })
          .merge(defaultLocatorOptionSchema),
      ),
  }),
  z.strictObject({
    expectToContainText: z
      .strictObject({
        expected: stringOrArraySchema,
        ignoreCase: z.boolean().optional(),
        useInnerText: z.boolean().optional(),
      })
      .merge(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToHaveAttribute: z
      .strictObject({
        name: z.string(),
        value: z.string().optional(),
        ignoreCase: z.boolean().optional(),
      })
      .merge(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToHaveClass: z
      .strictObject({
        expected: stringOrArraySchema,
      })
      .merge(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToHaveCount: z
      .strictObject({
        count: z.number(),
      })
      .merge(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToHaveCSS: z
      .strictObject({
        name: z.string(),
        value: z.string(),
      })
      .merge(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToHaveId: z
      .strictObject({ id: z.string() })
      .merge(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToHaveJSProperty: z
      .strictObject({
        name: z.string(),
        value: JsonSchema,
      })
      .merge(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToHaveScreenshot: z.string().or(
      z
        .strictObject({
          name: stringOrArraySchema.optional(),
          options: z.record(JsonSchema).optional(),
        })
        .merge(defaultLocatorOptionSchema),
    ),
  }),
  z.strictObject({
    expectToHaveText: z
      .strictObject({
        expected: stringOrArraySchema,
        ignoreCase: z.boolean().optional(),
        useInnerText: z.boolean().optional(),
      })
      .merge(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToHaveValue: z
      .strictObject({
        value: z.string(),
      })
      .merge(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectToHaveValues: z
      .strictObject({
        values: z.array(z.string()),
      })
      .merge(defaultLocatorOptionSchema),
  }),
  z.strictObject({
    expectPageToHaveScreenshot: z
      .strictObject({
        name: stringOrArraySchema.optional(),
        options: z.record(JsonSchema).optional(),
      })
      .merge(defaultPageOptionSchema),
  }),
  z.strictObject({
    expectPageToHaveTitle: z
      .string()
      .or(
        z
          .strictObject({ titleOrRegExp: z.string() })
          .merge(defaultPageOptionSchema),
      ),
  }),
  z.strictObject({
    expectPageToHaveURL: z
      .string()
      .or(
        z
          .strictObject({ urlOrRegExp: z.string() })
          .merge(defaultPageOptionSchema),
      ),
  }),
]);
export type AssertionShortcutSchema = z.infer<typeof AssertionShortcutSchema>;
const AnySchema = z.union([z.any(), AssertionShortcutSchema]);
type AnySchema = z.infer<typeof AnySchema>;

export const ASSERTION_SHORTCUT_METHODS = [
  "expectToBeAttached",
  "expectToBeChecked",
  "expectToBeDisabled",
  "expectToBeEditable",
  "expectToBeEmpty",
  "expectToBeEnabled",
  "expectToBeFocused",
  "expectToBeHidden",
  "expectToBeInViewport",
  "expectToBeVisible",
  "expectToContainText",
  "expectToHaveAttribute",
  "expectToHaveClass",
  "expectToHaveCount",
  "expectToHaveCSS",
  "expectToHaveId",
  "expectToHaveJSProperty",
  "expectToHaveScreenshot",
  "expectToHaveText",
  "expectToHaveValue",
  "expectToHaveValues",
  "expectPageToHaveScreenshot",
  "expectPageToHaveTitle",
  "expectPageToHaveURL",
] as const;

export function isAssertionShortcutSchema(
  schema: AnySchema,
): schema is AssertionShortcutSchema {
  if (typeof schema != "object") return false;

  for (const key of ASSERTION_SHORTCUT_METHODS) {
    if (key in schema) return true;
  }

  return false;
}

export function parseAssertionShortcutSchema(
  schema: AssertionShortcutSchema,
): TsString | undefined {
  if ("expectToBeAttached" in schema) {
    return parseLocatorAssertion("toBeAttached", schema.expectToBeAttached);
  }

  if ("expectToBeChecked" in schema) {
    return parseLocatorAssertion("toBeChecked", schema.expectToBeChecked);
  }

  if ("expectToBeDisabled" in schema) {
    return parseLocatorAssertion("toBeDisabled", schema.expectToBeDisabled);
  }

  if ("expectToBeEditable" in schema) {
    return parseLocatorAssertion("toBeEditable", schema.expectToBeEditable);
  }

  if ("expectToBeEmpty" in schema) {
    return parseLocatorAssertion("toBeEmpty", schema.expectToBeEmpty);
  }

  if ("expectToBeEnabled" in schema) {
    return parseLocatorAssertion("toBeEnabled", schema.expectToBeEnabled);
  }

  if ("expectToBeFocused" in schema) {
    return parseLocatorAssertion("toBeFocused", schema.expectToBeFocused);
  }

  if ("expectToBeHidden" in schema) {
    return parseLocatorAssertion("toBeHidden", schema.expectToBeHidden);
  }

  if ("expectToBeInViewport" in schema) {
    return parseLocatorAssertion("toBeInViewport", schema.expectToBeInViewport);
  }

  if ("expectToBeVisible" in schema) {
    return parseLocatorAssertion("toBeVisible", schema.expectToBeVisible);
  }

  if ("expectToContainText" in schema) {
    const { selector, not, expected, ...options } = schema.expectToContainText;

    const args: TsString[] = [];
    if (typeof expected === "string") {
      args.push(TsVariable.parse(expected));
    } else {
      args.push(new TsVariable(expected.map((text) => TsVariable.parse(text))));
    }

    if (Object.keys(options).length > 0) {
      args.push(TsVariable.parse(options));
    }

    return new LocatorAssertionString(
      "toContainText",
      selector,
      args,
      not ?? false,
    );
  }

  if ("expectToHaveAttribute" in schema) {
    const { selector, not, name, value, ...options } =
      schema.expectToHaveAttribute;

    const args: TsString[] = [TsVariable.parse(name)];
    if (value) {
      args.push(TsVariable.parse(value));
    }
    if (Object.keys(options).length > 0) {
      args.push(TsVariable.parse(options));
    }

    return new LocatorAssertionString(
      "toHaveAttribute",
      selector,
      args,
      not ?? false,
    );
  }

  if ("expectToHaveClass" in schema) {
    const { selector, not, expected, ...options } = schema.expectToHaveClass;

    const args: TsString[] = [];
    if (typeof expected === "string") {
      args.push(TsVariable.parse(expected));
    } else {
      args.push(new TsVariable(expected.map((text) => TsVariable.parse(text))));
    }

    if (Object.keys(options).length > 0) {
      args.push(TsVariable.parse(options));
    }

    return new LocatorAssertionString(
      "toHaveClass",
      selector,
      args,
      not ?? false,
    );
  }

  if ("expectToHaveCount" in schema) {
    const { selector, not, count, ...options } = schema.expectToHaveCount;

    const args: TsString[] = [TsVariable.parse(count)];
    if (Object.keys(options).length > 0) {
      args.push(TsVariable.parse(options));
    }
    return new LocatorAssertionString(
      "toHaveCount",
      selector,
      args,
      not ?? false,
    );
  }

  if ("expectToHaveCSS" in schema) {
    const { selector, not, name, value, ...options } = schema.expectToHaveCSS;

    const args: TsString[] = [TsVariable.parse(name), TsVariable.parse(value)];
    if (Object.keys(options).length > 0) {
      args.push(TsVariable.parse(options));
    }

    return new LocatorAssertionString(
      "toHaveCSS",
      selector,
      args,
      not ?? false,
    );
  }

  if ("expectToHaveId" in schema) {
    const { selector, not, id, ...options } = schema.expectToHaveId;

    const args: TsString[] = [TsVariable.parse(id)];
    if (Object.keys(options).length > 0) {
      args.push(TsVariable.parse(options));
    }
    return new LocatorAssertionString("toHaveId", selector, args, not ?? false);
  }

  if ("expectToHaveJSProperty" in schema) {
    const { selector, not, name, value, ...options } =
      schema.expectToHaveJSProperty;

    const args: TsString[] = [TsVariable.parse(name), TsVariable.parse(value)];
    if (Object.keys(options).length > 0) {
      args.push(TsVariable.parse(options));
    }

    return new LocatorAssertionString(
      "toHaveJSProperty",
      selector,
      args,
      not ?? false,
    );
  }

  if ("expectToHaveScreenshot" in schema) {
    if (typeof schema.expectToHaveScreenshot === "string") {
      return new LocatorAssertionString(
        "toHaveScreenshot",
        schema.expectToHaveScreenshot,
        [],
        false,
      );
    }

    const { selector, not, name, options, ...remainings } =
      schema.expectToHaveScreenshot;
    const args: TsString[] = [];
    if (name) {
      args.push(TsVariable.parse(name));
    }

    let opts = options || {};
    if (Object.keys(remainings).length > 0) {
      opts = { ...opts, ...remainings };
    }
    if (Object.keys(opts).length > 0) {
      args.push(TsVariable.parse(opts));
    }

    return new LocatorAssertionString(
      "toHaveScreenshot",
      selector,
      args,
      not ?? false,
    );
  }

  if ("expectToHaveText" in schema) {
    const { selector, not, expected, ...options } = schema.expectToHaveText;

    const args: TsString[] = [TsVariable.parse(expected)];
    if (Object.keys(options).length > 0) {
      args.push(TsVariable.parse(options));
    }

    return new LocatorAssertionString(
      "toHaveText",
      selector,
      args,
      not ?? false,
    );
  }

  if ("expectToHaveValue" in schema) {
    const { selector, not, value, ...options } = schema.expectToHaveValue;

    const args: TsString[] = [TsVariable.parse(value)];
    if (Object.keys(options).length > 0) {
      args.push(TsVariable.parse(options));
    }

    return new LocatorAssertionString(
      "toHaveValue",
      selector,
      args,
      not ?? false,
    );
  }

  if ("expectToHaveValues" in schema) {
    const { selector, not, values, ...options } = schema.expectToHaveValues;

    const args: TsString[] = [TsVariable.parse(values)];
    if (Object.keys(options).length > 0) {
      args.push(TsVariable.parse(options));
    }

    return new LocatorAssertionString(
      "toHaveValues",
      selector,
      args,
      not ?? false,
    );
  }

  if ("expectPageToHaveScreenshot" in schema) {
    const { not, name, options, ...remainings } =
      schema.expectPageToHaveScreenshot;

    const args: TsString[] = [];
    if (name) {
      args.push(TsVariable.parse(name));
    }

    let opts = options || {};
    if (Object.keys(remainings).length > 0) {
      opts = { ...opts, ...remainings };
    }
    if (Object.keys(opts).length > 0) {
      args.push(TsVariable.parse(opts));
    }

    return new PageAssertionString("toHaveScreenshot", args, not ?? false);
  }

  if ("expectPageToHaveTitle" in schema) {
    if (typeof schema.expectPageToHaveTitle === "string") {
      return new PageAssertionString(
        "toHaveTitle",
        [TsVariable.parse(schema.expectPageToHaveTitle)],
        false,
      );
    } else {
      const { titleOrRegExp, not, ...remains } = schema.expectPageToHaveTitle;
      return new PageAssertionString(
        "toHaveTitle",
        [TsVariable.parse(titleOrRegExp), TsVariable.parse(remains)],
        not ?? false,
      );
    }
  }

  if ("expectPageToHaveURL" in schema) {
    if (typeof schema.expectPageToHaveURL === "string") {
      return new PageAssertionString(
        "toHaveURL",
        [TsVariable.parse(schema.expectPageToHaveURL)],
        false,
      );
    } else {
      const { urlOrRegExp, not, ...remains } = schema.expectPageToHaveURL;
      return new PageAssertionString(
        "toHaveURL",
        [TsVariable.parse(urlOrRegExp), TsVariable.parse(remains)],
        not ?? false,
      );
    }
  }

  neverVisit("unknown assertionShortcut", schema);
}

function parseLocatorAssertion(
  method: string,
  value:
    | string
    | (Record<string, JsonSchema> & { selector: string; not?: boolean }),
): LocatorAssertionString {
  if (typeof value === "string") {
    return new LocatorAssertionString(method, value, [], false);
  } else {
    const { selector, not, ...remains } = value;
    return new LocatorAssertionString(
      method,
      selector,
      [TsVariable.parse(remains)],
      not ?? false,
    );
  }
}
