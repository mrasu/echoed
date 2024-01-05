export type ConfigFileSchema = {
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
   * Path to other configs to override this configuration
   */
  overrides?: string[];
};
