import { CypressHttpMessage } from "@/integration/cypress/internal/cypressHttpMessage";

/**
 CypressHttpRequest is a minimal type for `CyHttpMessages.IncomingResponse` in "cypress/types/net-stubbing".

 Because CyHttpMessages.IncomingResponse cannot be imported via "cypress/types/net-stubbing" directly, declare the type here.
 */
export interface CypressHttpResponse extends CypressHttpMessage {
  statusCode: number;
}
