export type ConfigSchema = {
  /**
   * [Required] Output directory path
   */
  output: string;

  /**
   * Port number of the server receiving OpenTelemetry requests
   * Default: 3000
   */
  serverPort?: number;

  /**
   * Seconds to stop the server after the last test is finished
   * Default: 20
   */
  serverStopAfter?: number;

  /**
   * Enable debug log
   * Default: false
   */
  debug?: boolean;

  /**
   * Configurations for services
   */
  services?: {
    /**
     * [Required] Name of the service (value of the `service.name` in OpenTelemetry's resource attributes)
     */
    name: string;

    /**
     * Namespace of the service (value of the `service.namespace` in OpenTelemetry's resource attributes)
     * Default: undefined (meaning no `service.namespace` attribute exists)
     */
    namespace?: string;

    /**
     * OpenAPI specification
     *
     * The value can be string or object.
     * If it's string, it's treated as a file path of the OpenAPI specification.
     */
    openapi?:
      | string
      | {
          /**
           * file path of the OpenAPI specification
           */
          filePath: string;

          /**
           * base path of the OpenAPI's URL
           *
           * When not specified, the base path is extracted from the OpenAPI specification.
           */
          basePath?: string;
        };

    /**
     * Protocol buffer specification (`.proto` file)
     *
     * The value can be string or object.
     * If it's string, it's treated as a file path of the protocol buffer specification.
     */
    proto?:
      | string
      | {
          /**
           * file path of the OpenAPI specification
           */
          filePath: string;

          /**
           * List of services in the specification to be used
           *
           * When not specified, all services in the specification are considered to be used.
           * Note that the values should be the same with `rpc.service` attribute in OpenTelemetry.
           */
          services?: string[];
        };
  }[];

  /**
   * Propagation test configuration
   */
  propagationTest?: {
    /**
     * Enable propagation test
     * Default: true
     */
    enabled?: boolean;

    /**
     * Config to ignore specified spans from propagation test
     * Note that all conditions are OR.
     */
    ignore?: {
      /**
       * Attributes to ignore matched spans
       * Default: empty (not ignore anything)
       */
      attributes?: Record<string, string | boolean | number>;

      /**
       * Resource to ignore matched spans
       */
      resource?: {
        /**
         * Resource attributes to ignore matched spans
         * Default: empty (not ignore anything)
         */
        attributes?: Record<string, string | boolean | number>;
      };
    };
  };

  /**
   * Options for scenario
   */
  scenario?: {
    /**
     * Options for compilation
     */
    compile?: {
      /**
       * Path to the directory to read YAML files
       * Default: ./scenario
       */
      yamlDir?: string;

      /**
       * Path to the directory to output generated files
       * Default: ./scenario_gen
       */
      outDir?: string;

      /**
       * Whether to remove files in the output directory before compilation
       * Default: false
       */
      cleanOutDir?: boolean;

      /**
       * Number of retries
       * Default: 0 (no retry)
       */
      retry?: number;

      /**
       * Environment variables
       *
       * Value will be used as a fallback for when the environment variable is not set.
       * If value is null and the environment variable is not set, error will be thrown.
       */
      env?: Record<string, string | null>;

      /**
       * Option for plugins
       */
      plugin?: {
        /**
         * Option for runner plugins
         */
        runners?: {
          /**
           * Path to the module
           */
          module: string;

          /**
           * Name of the module object to import
           */
          name: string;

          /**
           * Options for the runner
           * Default: empty ({})
           *
           * Any option will be passed to the runner as-is
           * Refer `Variable` type for more details
           */
          option?: Record<string, AnyValue>;
        }[];

        /**
         * Option for asserter plugins
         */
        asserters?: {
          /**
           * Path to the module
           */
          module: string;

          /**
           * Name of the module object to import
           */
          name: string;

          /**
           * Options for the asserter
           * Default: empty ({})
           *
           * Any option will be passed to the plugin as-is
           * Refer `Variable` type for more details
           */
          option?: Record<string, AnyValue>;
        }[];

        /**
         * Option for common plugins
         */
        commons?: {
          /**
           * Path to the module
           *
           * `from DDD, {XXXX, YYY} import MMM` <- For MMM
           */
          module: string;

          /**
           * Names of the module object to import
           * Default: import nothing
           *
           * `from DDD, {XXXX, YYY} import MMM` <- For XXX and YYY
           */
          names?: string[];

          /**
           * Names of the default export object to import
           * Default: import nothing
           *
           * `from DDD, {XXXX, YYY} import MMM` <- For DDD
           */
          default?: string;
        }[];
      };
    };
  };

  /**
   * Path to other configs to override this configuration
   */
  overrides?: string[];
};

/**
 * AnyValue is type for arbitrary data to be used as-is
 *
 * You can use number or complex structure as AnyValue.
 * For example, below yaml defines example1 as number and example2 as complex structure:
 * ```yml
 * example1: 1
 *
 * example2: {a: {b: {c: 1, d: ["aa", 2]}}}
 * ```
 *
 * String is also valid but it behaves slightly different.
 *   1. By surrounding `${...}`, content is treated as variable instead of string.
 *   2. When `${...}` exists in the middle of string, content inside will be calculated as variable and the result will be transformed to string.
 *   3. `\$` is escaped to `$`
 *   4. Otherwise, content will be treated as normal string.
 *
 * For example, when you define `value` as `1`(number),
 * ```yml
 * example1: ${value}
 * example2: ${value} is number
 * example3: \${value}
 * example4: value
 * ```
 *
 * Each variable is equivalent to:
 * ```ts
 * const example1 = 1
 * const example2 = "1 is number"
 * const example3 = "${value}"
 * const example4 = "value"
 * ```
 */
export type AnyValue = unknown;
