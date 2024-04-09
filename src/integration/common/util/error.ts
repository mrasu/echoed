import { EchoedError } from "@/echoedError";
import { Logger } from "@/logger";

export function throwError(e: unknown): never {
  if (e instanceof EchoedError) {
    // Add new line to emphasize message.
    // Because long message including stacktrace will be printed after `throw e`, we need to emphasize message somehow.
    Logger.ln(2);
    Logger.error(e.message);
    Logger.ln(2);
  }

  throw e;
}
