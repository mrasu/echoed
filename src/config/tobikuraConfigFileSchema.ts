export type TobikuraConfigFileSchema = {
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
};
