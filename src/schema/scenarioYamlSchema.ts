import { AnyValue } from "@/schema/configSchema";

export type ScenarioYamlSchema = {
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
      };

      /**
       * Assertion to check
       * Default: no assertion
       *
       * 1. When assert is string, the value will be treated as-is.
       *    For example, when yaml is:
       *    ```yml
       *    assert:
       *      - expect(_.response.status).toBe(200)
       *      - expect(_.jsonBody.items.length).toBe(0)
       *    ```
       *
       *    It is equivalent to:
       *    ```ts
       *    expect(_.response.status).toBe(200);
       *    expect(_.jsonBody.items.length).toBe(0);
       *    ```
       * 2. When assert is record,
       *    Key of the record is asserter's name and two values are the arguments to be passed to the asserter.
       */
      assert?: (string | Record<string, [AnyValue, AnyValue]>)[];

      /**
       * Store variables to use in subsequent steps
       * Default: store nothing
       */
      bind?: Record<string, AnyValue>;
    }[];
  }[];
};
