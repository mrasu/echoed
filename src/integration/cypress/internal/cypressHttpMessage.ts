// CypressHttpMessage is a type for CyHttpMessages.BaseMessage in "cypress/types/net-stubbing"
// Because CyHttpMessages.BaseMessage cannot be imported via "cypress/types/net-stubbing" directly, declare the type here.
export interface CypressHttpMessage {
  body: unknown;
  headers: { [key: string]: string | string[] };
}
