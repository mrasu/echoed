import { ReporterOnStartOptions } from "@jest/reporters";

export function buildReporterOnStartOptions(): ReporterOnStartOptions {
  return {
    estimatedTime: 0,
    showStatus: false,
  };
}
