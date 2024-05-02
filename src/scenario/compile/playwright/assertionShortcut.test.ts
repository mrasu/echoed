import { TsVariable } from "@/scenario/compile/common/tsVariable";
import {
  AssertionShortcutSchema,
  isAssertionShortcutSchema,
  parseAssertionShortcutSchema,
} from "@/scenario/compile/playwright/assertionShortcut";
import { LocatorAssertionString } from "@/scenario/compile/playwright/locatorAssertionString";
import { PageAssertionString } from "@/scenario/compile/playwright/pageAssertionString";
import { JsonSchema } from "@/type/jsonZod";

describe("isAssertionShortcutSchema", () => {
  describe("when schema matches AssertionShortcutSchema", () => {
    it("should return true", () => {
      const schema = { expectToBeAttached: "abc" };
      expect(isAssertionShortcutSchema(schema)).toBe(true);
    });
  });

  describe("when schema does not match AssertionShortcutSchema", () => {
    it("should return false", () => {
      const schema = { raw: "abc" };
      expect(isAssertionShortcutSchema(schema)).toBe(false);
    });
  });
});

describe("parseAssertionShortcutSchema", () => {
  const selectorText = "selector";

  const fullSchemas: {
    schema: AssertionShortcutSchema;
    extraName?: string;
    expectedMethod: string;
    expectedArgs?: JsonSchema[];
    expectedOptions: JsonSchema;
  }[] = [
    {
      expectedMethod: "toBeAttached",
      schema: {
        expectToBeAttached: {
          selector: selectorText,
          timeout: 123,
          not: true,
          attached: true,
        },
      },
      expectedOptions: {
        timeout: 123,
        attached: true,
      },
    },
    {
      expectedMethod: "toBeChecked",
      schema: {
        expectToBeChecked: {
          selector: selectorText,
          timeout: 123,
          not: true,
          checked: true,
        },
      },
      expectedOptions: {
        timeout: 123,
        checked: true,
      },
    },
    {
      expectedMethod: "toBeDisabled",
      schema: {
        expectToBeDisabled: {
          selector: selectorText,
          timeout: 123,
          not: true,
        },
      },
      expectedOptions: {
        timeout: 123,
      },
    },
    {
      expectedMethod: "toBeEditable",
      schema: {
        expectToBeEditable: {
          selector: selectorText,
          timeout: 123,
          not: true,
          editable: true,
        },
      },
      expectedOptions: {
        timeout: 123,
        editable: true,
      },
    },
    {
      expectedMethod: "toBeEmpty",
      schema: {
        expectToBeEmpty: {
          selector: selectorText,
          timeout: 123,
          not: true,
        },
      },
      expectedOptions: {
        timeout: 123,
      },
    },
    {
      expectedMethod: "toBeEnabled",
      schema: {
        expectToBeEnabled: {
          selector: selectorText,
          timeout: 123,
          not: true,
          enabled: true,
        },
      },
      expectedOptions: {
        timeout: 123,
        enabled: true,
      },
    },
    {
      expectedMethod: "toBeFocused",
      schema: {
        expectToBeFocused: {
          selector: selectorText,
          timeout: 123,
          not: true,
        },
      },
      expectedOptions: {
        timeout: 123,
      },
    },
    {
      expectedMethod: "toBeHidden",
      schema: {
        expectToBeHidden: {
          selector: selectorText,
          timeout: 123,
          not: true,
        },
      },
      expectedOptions: {
        timeout: 123,
      },
    },
    {
      expectedMethod: "toBeInViewport",
      schema: {
        expectToBeInViewport: {
          selector: selectorText,
          timeout: 123,
          not: true,
          ratio: 0.5,
        },
      },
      expectedOptions: {
        timeout: 123,
        ratio: 0.5,
      },
    },
    {
      expectedMethod: "toBeVisible",
      schema: {
        expectToBeVisible: {
          selector: selectorText,
          timeout: 123,
          not: true,
          visible: true,
        },
      },
      expectedOptions: {
        timeout: 123,
        visible: true,
      },
    },
    {
      expectedMethod: "toContainText",
      schema: {
        expectToContainText: {
          selector: selectorText,
          timeout: 123,
          not: true,
          expected: ["aa", "bb"],
          ignoreCase: true,
          useInnerText: true,
        },
      },
      expectedArgs: [["aa", "bb"]],
      expectedOptions: {
        timeout: 123,
        ignoreCase: true,
        useInnerText: true,
      },
    },
    {
      expectedMethod: "toHaveAttribute",
      schema: {
        expectToHaveAttribute: {
          selector: selectorText,
          timeout: 123,
          not: true,
          name: "name",
          value: "value",
          ignoreCase: true,
        },
      },
      expectedArgs: ["name", "value"],
      expectedOptions: {
        timeout: 123,
        ignoreCase: true,
      },
    },
    {
      expectedMethod: "toHaveAttribute",
      extraName: "toHaveAttributeWithoutValue",
      schema: {
        expectToHaveAttribute: {
          selector: selectorText,
          timeout: 123,
          not: true,
          name: "name",
          ignoreCase: true,
        },
      },
      expectedArgs: ["name"],
      expectedOptions: {
        timeout: 123,
        ignoreCase: true,
      },
    },
    {
      expectedMethod: "toHaveClass",
      schema: {
        expectToHaveClass: {
          selector: selectorText,
          timeout: 123,
          not: true,
          expected: ["aa", "bb"],
        },
      },
      expectedArgs: [["aa", "bb"]],
      expectedOptions: {
        timeout: 123,
      },
    },
    {
      expectedMethod: "toHaveCount",
      schema: {
        expectToHaveCount: {
          selector: selectorText,
          timeout: 123,
          not: true,
          count: 111,
        },
      },
      expectedArgs: [111],
      expectedOptions: {
        timeout: 123,
      },
    },
    {
      expectedMethod: "toHaveCSS",
      schema: {
        expectToHaveCSS: {
          selector: selectorText,
          timeout: 123,
          not: true,
          name: "name",
          value: "value",
        },
      },
      expectedArgs: ["name", "value"],
      expectedOptions: {
        timeout: 123,
      },
    },
    {
      expectedMethod: "toHaveId",
      schema: {
        expectToHaveId: {
          selector: selectorText,
          timeout: 123,
          not: true,
          id: "id",
        },
      },
      expectedArgs: ["id"],
      expectedOptions: {
        timeout: 123,
      },
    },
    {
      expectedMethod: "toHaveJSProperty",
      schema: {
        expectToHaveJSProperty: {
          selector: selectorText,
          timeout: 123,
          not: true,
          name: "name",
          value: "value",
        },
      },
      expectedArgs: ["name", "value"],
      expectedOptions: {
        timeout: 123,
      },
    },
    {
      expectedMethod: "toHaveScreenshot",
      schema: {
        expectToHaveScreenshot: {
          selector: selectorText,
          timeout: 123,
          not: true,
          name: "name",
          options: {
            animations: "disabled",
            caret: "hide",
          },
        },
      },
      expectedArgs: ["name"],
      expectedOptions: {
        timeout: 123,
        animations: "disabled",
        caret: "hide",
      },
    },
    {
      expectedMethod: "toHaveScreenshot",
      extraName: "toHaveScreenshotWithoutName",
      schema: {
        expectToHaveScreenshot: {
          selector: selectorText,
          timeout: 123,
          not: true,
          options: {
            animations: "disabled",
            caret: "hide",
          },
        },
      },
      expectedOptions: {
        timeout: 123,
        animations: "disabled",
        caret: "hide",
      },
    },
    {
      expectedMethod: "toHaveText",
      schema: {
        expectToHaveText: {
          selector: selectorText,
          timeout: 123,
          not: true,
          expected: ["aa", "bb"],
          ignoreCase: true,
          useInnerText: true,
        },
      },
      expectedArgs: [["aa", "bb"]],
      expectedOptions: {
        timeout: 123,
        ignoreCase: true,
        useInnerText: true,
      },
    },
    {
      expectedMethod: "toHaveValue",
      schema: {
        expectToHaveValue: {
          selector: selectorText,
          timeout: 123,
          not: true,
          value: "value",
        },
      },
      expectedArgs: ["value"],
      expectedOptions: {
        timeout: 123,
      },
    },
    {
      expectedMethod: "toHaveValues",
      schema: {
        expectToHaveValues: {
          selector: selectorText,
          timeout: 123,
          not: true,
          values: ["aa", "bb"],
        },
      },
      expectedArgs: [["aa", "bb"]],
      expectedOptions: {
        timeout: 123,
      },
    },
    {
      expectedMethod: "toHaveScreenshot",
      schema: {
        expectPageToHaveScreenshot: {
          timeout: 123,
          not: true,
          name: ["aa", "bb"],
          options: {
            animations: "disabled",
            caret: "hide",
          },
        },
      },
      expectedArgs: [["aa", "bb"]],
      expectedOptions: {
        timeout: 123,
        animations: "disabled",
        caret: "hide",
      },
    },
    {
      expectedMethod: "toHaveScreenshot",
      extraName: "toHaveScreenshotWithoutName",
      schema: {
        expectPageToHaveScreenshot: {
          timeout: 123,
          not: true,
          options: {
            animations: "disabled",
            caret: "hide",
          },
        },
      },
      expectedOptions: {
        timeout: 123,
        animations: "disabled",
        caret: "hide",
      },
    },
    {
      expectedMethod: "toHaveTitle",
      schema: {
        expectPageToHaveTitle: {
          timeout: 123,
          not: true,
          titleOrRegExp: "title",
        },
      },
      expectedArgs: ["title"],
      expectedOptions: {
        timeout: 123,
      },
    },
    {
      expectedMethod: "toHaveURL",
      schema: {
        expectPageToHaveURL: {
          timeout: 123,
          not: true,
          urlOrRegExp: "url",
        },
      },
      expectedArgs: ["url"],
      expectedOptions: {
        timeout: 123,
      },
    },
  ];

  const assertParsedLocatorAssertionString = (
    key: string,
    extraName?: string,
  ): void => {
    const { schema, expectedOptions, expectedArgs, expectedMethod } =
      fullSchemas.find((v) => key in v.schema && v.extraName === extraName)!;

    const args = expectedArgs?.map((v) => TsVariable.parse(v)) ?? [];
    args.push(TsVariable.parse(expectedOptions));
    expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
      new LocatorAssertionString(expectedMethod, selectorText, args, true),
    );
  };

  const assertParsedPageAssertionString = (
    key: string,
    extraName?: string,
  ): void => {
    const { schema, expectedOptions, expectedArgs, expectedMethod } =
      fullSchemas.find((v) => key in v.schema && v.extraName === extraName)!;

    const args = expectedArgs?.map((v) => TsVariable.parse(v)) ?? [];
    args.push(TsVariable.parse(expectedOptions));
    expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
      new PageAssertionString(expectedMethod, args, true),
    );
  };

  // test all patterns in AssertionShortcutSchema
  describe("when using expectToBeAttached", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = { expectToBeAttached: "selector" };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString("toBeAttached", "selector", [], false),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToBeAttached");
      });
    });
  });

  describe("when using expectToBeChecked", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = { expectToBeChecked: "selector" };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString("toBeChecked", "selector", [], false),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToBeChecked");
      });
    });
  });

  describe("when using expectToBeDisabled", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = { expectToBeDisabled: "selector" };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString("toBeDisabled", "selector", [], false),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToBeDisabled");
      });
    });
  });

  describe("when using expectToBeEditable", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = { expectToBeEditable: "selector" };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString("toBeEditable", "selector", [], false),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToBeEditable");
      });
    });
  });

  describe("when using expectToBeEmpty", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = { expectToBeEmpty: "selector" };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString("toBeEmpty", "selector", [], false),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToBeEmpty");
      });
    });
  });

  describe("when using expectToBeEnabled", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = { expectToBeEnabled: "selector" };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString("toBeEnabled", "selector", [], false),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToBeEnabled");
      });
    });
  });

  describe("when using expectToBeFocused", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = { expectToBeFocused: "selector" };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString("toBeFocused", "selector", [], false),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToBeFocused");
      });
    });
  });

  describe("when using expectToBeHidden", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = { expectToBeHidden: "selector" };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString("toBeHidden", "selector", [], false),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToBeHidden");
      });
    });
  });

  describe("when using expectToBeInViewport", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = { expectToBeInViewport: "selector" };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString("toBeInViewport", "selector", [], false),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToBeInViewport");
      });
    });
  });

  describe("when using expectToBeVisible", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = { expectToBeVisible: "selector" };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString("toBeVisible", "selector", [], false),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToBeVisible");
      });
    });
  });

  describe("when using expectToContainText", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = {
          expectToContainText: { selector: "selector", expected: "foo" },
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString(
            "toContainText",
            "selector",
            [TsVariable.parse("foo")],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToContainText");
      });
    });
  });

  describe("when using expectToHaveAttribute", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = {
          expectToHaveAttribute: { selector: "selector", name: "foo" },
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString(
            "toHaveAttribute",
            "selector",
            [TsVariable.parse("foo")],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToHaveAttribute");
      });
    });

    describe("when value is object without value", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString(
          "expectToHaveAttribute",
          "toHaveAttributeWithoutValue",
        );
      });
    });
  });

  describe("when using expectToHaveClass", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = {
          expectToHaveClass: { selector: "selector", expected: "foo" },
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString(
            "toHaveClass",
            "selector",
            [TsVariable.parse("foo")],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToHaveClass");
      });
    });
  });

  describe("when using expectToHaveCount", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = {
          expectToHaveCount: { selector: "selector", count: 111 },
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString(
            "toHaveCount",
            "selector",
            [TsVariable.parse(111)],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToHaveCount");
      });
    });
  });

  describe("when using expectToHaveCSS", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = {
          expectToHaveCSS: {
            selector: "selector",
            name: "name",
            value: "value",
          },
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString(
            "toHaveCSS",
            "selector",
            [TsVariable.parse("name"), TsVariable.parse("value")],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToHaveCSS");
      });
    });
  });

  describe("when using expectToHaveId", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = {
          expectToHaveId: {
            selector: "selector",
            id: "id",
          },
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString(
            "toHaveId",
            "selector",
            [TsVariable.parse("id")],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToHaveId");
      });
    });
  });

  describe("when using expectToHaveJSProperty", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = {
          expectToHaveJSProperty: {
            selector: "selector",
            name: "name",
            value: "value",
          },
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString(
            "toHaveJSProperty",
            "selector",
            [TsVariable.parse("name"), TsVariable.parse("value")],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToHaveJSProperty");
      });
    });
  });

  describe("when using expectToHaveScreenshot", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = {
          expectToHaveScreenshot: {
            selector: "selector",
            name: "name",
          },
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString(
            "toHaveScreenshot",
            "selector",
            [TsVariable.parse("name")],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToHaveScreenshot");
      });
    });

    describe("when value is object without name", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString(
          "expectToHaveScreenshot",
          "toHaveScreenshotWithoutName",
        );
      });
    });
  });

  describe("when using expectToHaveText", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = {
          expectToHaveText: {
            selector: "selector",
            expected: "foo",
          },
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString(
            "toHaveText",
            "selector",
            [TsVariable.parse("foo")],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToHaveText");
      });
    });
  });

  describe("when using expectToHaveValue", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = {
          expectToHaveValue: {
            selector: "selector",
            value: "foo",
          },
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString(
            "toHaveValue",
            "selector",
            [TsVariable.parse("foo")],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToHaveValue");
      });
    });
  });

  describe("when using expectToHaveValues", () => {
    describe("when value is string", () => {
      it("should return LocatorAssertionString", () => {
        const schema = {
          expectToHaveValues: {
            selector: "selector",
            values: ["foo", "bar"],
          },
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new LocatorAssertionString(
            "toHaveValues",
            "selector",
            [TsVariable.parse(["foo", "bar"])],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedLocatorAssertionString("expectToHaveValues");
      });
    });
  });

  describe("when using expectPageToHaveScreenshot", () => {
    describe("when value is string", () => {
      it("should return PageAssertionString", () => {
        const schema = {
          expectPageToHaveScreenshot: {
            name: "name",
          },
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new PageAssertionString(
            "toHaveScreenshot",
            [TsVariable.parse("name")],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedPageAssertionString("expectPageToHaveScreenshot");
      });
    });

    describe("when value is object without name", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedPageAssertionString(
          "expectPageToHaveScreenshot",
          "toHaveScreenshotWithoutName",
        );
      });
    });
  });

  describe("when using expectPageToHaveTitle", () => {
    describe("when value is string", () => {
      it("should return PageAssertionString", () => {
        const schema = {
          expectPageToHaveTitle: "title",
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new PageAssertionString(
            "toHaveTitle",
            [TsVariable.parse("title")],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedPageAssertionString("expectPageToHaveTitle");
      });
    });
  });

  describe("when using expectPageToHaveURL", () => {
    describe("when value is string", () => {
      it("should return PageAssertionString", () => {
        const schema = {
          expectPageToHaveURL: "title",
        };
        expect(parseAssertionShortcutSchema(schema)).toStrictEqual(
          new PageAssertionString(
            "toHaveURL",
            [TsVariable.parse("title")],
            false,
          ),
        );
      });
    });

    describe("when value is object", () => {
      it("should return LocatorAssertionString", () => {
        assertParsedPageAssertionString("expectPageToHaveURL");
      });
    });
  });
});
