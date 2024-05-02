import { AnyValue } from "@/schema/configSchema";

// prettier-ignore
export type PlaywrightScenarioYamlSchema = {
  /**
   * Number of times to retry the failed test.
   * Default: 0 (no retry)
   */
  retry?: number;

  /**
   * Variable's name and value to be used.
   * Default: no variable
   */
  variable?: Record<string, AnyValue>;

  /**
   * Option to replace configured runner's config
   * Default: no override
   */
  runners?: {
    /**
     * Name of the runner
     */
    name: string;

    /**
     * Option for the runner replacing the config's option
     */
    option?: Record<string, AnyValue>;
  }[];

  /**
   * Hook to run before/after the scenario
   * Default: no hook
   */
  hook?: {
    /**
     * Hooks to run before any of the scenarios.
     * Default: no hook
     *
     * The execution order is the same with defined.
     */
    beforeAll?: (
      /**
       * Plain text will be treated as TypeScript as-is.
       *
       * For example, when yaml is:
       * ```yml
       * beforeAll:
       *   - await db.clean()
       *   - await db.setup()
       * ```
       *
       * It is equivalent to:
       * ```ts
       * beforeAll(async () => {
       *   await db.clean();
       *   await db.setup();
       * })
       * ```
       */
      | string
      | {
          /**
           * Record's values will be stored as variables and can be accessed with record's key in other places.
           */
          bind: Record<string, AnyValue>;

          /**
           * Fixtures to be used in the hook.
           *
           * For example, when yaml is:
           * ```yml
           * beforeAll:
           *  - fixtures:
           *      - page
           * ```
           *
           * It is equivalent to:
           * ```ts
           * test.beforeAll(async ({page}) => {
           *  ...
           * })
           * ```
           */
          fixtures?: string[];
        }
      | {
          /**
           * TypeScript text to be run as-is.
           */
          raw: string;

          /**
           * Fixtures to be used in the hook.
           * Refer `bind` section in `beforeAll` for detail.
           */
          fixtures?: string[]
        }
    )[];

    /**
     * Hooks to run after all the scenarios.
     * Default: no hook
     *
     * The execution order is the same with defined.
     *
     * Refer `beforeAll` for its value.
     */
    afterAll?: (
      | string
      | {
          bind: Record<string, AnyValue>;
          fixtures?: string[];
        }
      | {
          raw: string;
          fixtures?: string[]
        }
    )[];

    /**
     * Hooks to run before each of the scenarios.
     * Default: no hook
     *
     * The execution order is the same with defined.
     *
     * Refer `beforeAll` for its value.
     */
    beforeEach?: (
      | string
      | {
          bind: Record<string, AnyValue>;
          fixtures?: string[];
        }
      | {
          raw: string;
          fixtures?: string[]
        }
    )[];

    /**
     * Hooks to run after each of the scenarios.
     * Default: no hook
     *
     * The execution order is the same with defined.
     *
     * Refer `beforeAll` for its value.
     */
    afterEach?: (
      | string
      | {
          bind: Record<string, AnyValue>;
          fixtures?: string[];
        }
      | {
          raw: string;
          fixtures?: string[]
        }
    )[];
  };

  /**
   * Scenarios
   */
  scenarios: {
    /**
     * Name of the scenario
     */
    name: string;

    /**
     * Whether to skip the scenario
     * Default: false (not skip)
     */
    skip?: boolean;

    /**
     * Variable's name and value to be used.
     * Default: no variable
     */
    variable?: Record<string, AnyValue>;

    /**
     * Steps
     */
    steps: {
      /**
       * Description of the step
       * Default: no description
       */
      description?: string;

      /**
       * Variable's name and value to be used.
       * Default: no variable
       */
      variable?: Record<string, AnyValue>;

      /**
       * Actions to establish act's preconditions
       * Default: no arrange
       */
      arrange?: (
          /**
           * Plain text will be treated as TypeScript as-is.
           */
        | string
        | {
            /**
             * Name of the runner
             */
            runner: string;

            /**
             * Argument to pass to the runner
             */
            argument?: AnyValue;

            /**
             * Value to override runner's default option
             * Default: no override
             *
             * Only keys listed here will be overridden.
             * Other keys will follow runner's default option.
             */
            option?: Record<string, AnyValue>;

            /**
             * Store variables to reference in the current step
             *
             * You can use `_` for the result of the runner and `_prepares` for the result of the previous arranges.
             */
            bind?: Record<string, AnyValue>;
          }
        | {
            /**
             * Store variables to reference in the current step
             */
            bind: Record<string, AnyValue>;
          }
        | /**
           * Convenient way to use common actions
           */
          AssertionShortcutSchema
      )[];

      /**
       * Action to run
       * Default: no action
       */
      act?: {
        /**
         * Name of the runner
         */
        runner: string;

        /**
         * Argument to pass to the runner
         */
        argument?: AnyValue;

        /**
         * Value to override runner's default option
         * Default: no override
         *
         * Only keys listed here will be overridden.
         * Other keys will follow runner's default option.
         */
        option?: Record<string, AnyValue>;
      } | {
        /**
         * TypeScript text to be run as-is.
         * The result will be stored into `_` (same with runner).
         *
         * For example, `raw: "await db.query()"` is equivalent to `const _ = await db.query()`.
         */
        raw: string;
      };

      /**
       * Assertion to check
       * Default: no assertion
       */
      assert?: (
        /**
         * string will be treated as-is.
         *
         * For example, when yaml is:
         * ```yml
         * assert:
         *   - expect(_.response.status).toBe(200)
         *   - expect(_.jsonBody.items.length).toBe(0)
         * ```
         *
         * It is equivalent to:
         * ```ts
         * expect(_.response.status).toBe(200);
         * expect(_.jsonBody.items.length).toBe(0);
         * ```
         */
        string |

        /**
         * Key of the record is asserter's name and two values are the arguments to be passed to the asserter.
         */
        Record<string, [AnyValue, AnyValue]> |

        /**
         * Convenient way to use common assertions
         */
        AssertionShortcutSchema
      )[];

      /**
       * Store variables to use in subsequent steps
       * Default: store nothing
       */
      bind?: Record<string, AnyValue>;
    }[];
  }[];
};

// prettier-ignore
type AssertionShortcutSchema =
  | {
      /**
       * Run `toBeAttached` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toBeAttached()`.
       */
      expectToBeAttached: string | { selector: string; attached?: boolean, timeout?: number, not?: boolean };
    }
  | {
    /**
     * Run `toBeChecked` assertion
     *
     * Equivalent to `expect(page.locator(selector)).toBeChecked()`.
     */
      expectToBeChecked: string | { selector: string; checked?: boolean, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toBeDisabled` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toBeDisabled()`.
       */
      expectToBeDisabled: string | {selector: string , timeout?: number, not?: boolean};
    }
  | {
      /**
       * Run `toBeEditable` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toBeEditable()`.
       */
      expectToBeEditable: string | { selector: string; editable?: boolean, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toBeEmpty` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toBeEmpty()`.
       */
      expectToBeEmpty: string | {selector: string , timeout?: number, not?: boolean};
    }
  | {
      /**
       * Run `toBeEnabled` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toBeEnabled()`.
       */
      expectToBeEnabled: string | { selector: string; enabled?: boolean, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toBeFocused` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toBeFocused()`.
       */
      expectToBeFocused: string | {selector: string , timeout?: number, not?: boolean};
    }
  | {
      /**
       * Run `toBeHidden` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toBeHidden()`.
       */
      expectToBeHidden: string | {selector: string , timeout?: number, not?: boolean};
    }
  | {
      /**
       * Run `toBeInViewport` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toBeInViewport()`.
       */
      expectToBeInViewport: string | { selector: string; ratio?: number, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toBeVisible` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toBeVisible()`.
       */
      expectToBeVisible: string | { selector: string; visible?: boolean, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toContainText` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toContainText(expected)`.
       */
      expectToContainText: { selector: string; expected: string | string[]; ignoreCase?: boolean; useInnerText?: boolean, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toHaveAttribute` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toHaveAttribute(name, value)`.
       */
      expectToHaveAttribute: { selector: string, name: string, value?: string, ignoreCase?: boolean, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toHaveClass` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toHaveClass(expected)`.
       */
      expectToHaveClass: { selector: string; expected: string | string[], timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toHaveCount` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toHaveCount(count)`.
       */
      expectToHaveCount: { selector: string; count: number, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toHaveCSS` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toHaveCSS(name, value)`.
       */
      expectToHaveCSS: { selector: string; name: string; value: string, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toHaveId` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toHaveId(id)`.
       */
      expectToHaveId: { selector: string; id: string, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toHaveJSProperty` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toHaveJSProperty(name, value)`.
       */
      expectToHaveJSProperty: { selector: string, name: string, value: AnyValue, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toHaveScreenshot` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toHaveScreenshot(name)`.
       */
      expectToHaveScreenshot:
        | string
        | { selector: string, name?: string | string[], options?: Record<string, AnyValue>, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toHaveText` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toHaveText(expected)`.
       */
      expectToHaveText: { selector: string, expected: string | string[], ignoreCase?: boolean, useInnerText?: boolean, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toHaveValue` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toHaveValue(value)`.
       */
      expectToHaveValue: { selector: string; value: string, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toHaveValues` assertion
       *
       * Equivalent to `expect(page.locator(selector)).toHaveValues(values)`.
       */
      expectToHaveValues: { selector: string, values: string[], timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toHaveScreenshot` assertion
       *
       * Equivalent to `expect(page).toHaveScreenshot(name)`.
       */
      expectPageToHaveScreenshot: { name?: string | string[], options?: Record<string, AnyValue>, timeout?: number, not?: boolean };
    }
  | {
      /**
       * Run `toHaveTitle` assertion
       *
       * Equivalent to `expect(page).toHaveTitle(titleOrRegExp)`.
       */
      expectPageToHaveTitle: string | { titleOrRegExp: string, timeout?: number, not?: boolean};
    }
  | {
      /**
       * Run `toHaveURL` assertion
       *
       * Equivalent to `expect(page).toHaveURL(urlOrRegExp)`.
       */
      expectPageToHaveURL: string | { urlOrRegExp: string, timeout?: number, not?: boolean};
    };
