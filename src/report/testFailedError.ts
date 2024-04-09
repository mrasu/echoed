import { EchoedError } from "@/echoedError";

export class TestFailedError extends EchoedError {
  constructor(message: string) {
    super(message);
  }
}
