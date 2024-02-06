import { EchoedError } from "@/echoedError";

export class InvalidConfigError extends EchoedError {
  constructor(message: string) {
    super(`Invalid configuration. ${message}`);
  }
}
