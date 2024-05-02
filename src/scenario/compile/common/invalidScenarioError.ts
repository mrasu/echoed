import { EchoedError } from "@/echoedError";

export class InvalidScenarioError extends EchoedError {
  constructor(message: string) {
    super(`Invalid scenario. ${message}`);
  }
}
