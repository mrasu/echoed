import { CypressHttpMessage } from "@/integration/cypress/internal/cypressHttpMessage";
import { CypressHttpResponse } from "@/integration/cypress/internal/cypressHttpResponse";

/**
 CypressHttpRequest is a minimal type for `CyHttpMessages.IncomingRequest` in "cypress/types/net-stubbing".

 Because CyHttpMessages.IncomingRequest cannot be imported via "cypress/types/net-stubbing" directly, declare the type here.
 */
export interface CypressHttpRequest extends CypressHttpMessage {
  url: string;
  method: string;

  on(
    eventName: "response",
    fn: (res: CypressHttpResponse) => Promise<void>,
  ): this;
}
