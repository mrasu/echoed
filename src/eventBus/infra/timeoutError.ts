import { EchoedError } from "@/echoedError";

export class TimeoutError extends EchoedError {
  constructor() {
    super("timeout");
  }
}
