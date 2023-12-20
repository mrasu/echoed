import { detect } from "detect-browser";

const USER_AGENT_REG_BY_HUMAN = /^(curl|wget|postman|insomnia)\//;

/**
 * Check if the user-agent is internal program.
 *
 * To identify if Otel's trace started because new request comes or parent's context was not propagated correctly,
 *    we can use user-agent to know if the request comes from internal server(e.g. another service of microservice, Proxy etc.) or external network.
 *
 * When user-agent is Browser or SearchBot, as it comes from external, this function returns false.
 * When user-agent is Curl or Postman, as it's made by human, this function returns false.
 * When user-agent cannot be categorised, we think the request comes from internal server. So this function returns true.
 *
 * @param userAgent
 */
export function isUserAgentInternalProgram(userAgent: string): boolean {
  const type = detect(userAgent)?.type;
  if (type === "browser" || type === "bot-device" || type === "react-native") {
    return false;
  }

  if (type === "bot") {
    // Because "bot" is a SearchBot like Googlebot, we can say user-agent is not internal program.
    // c.f. https://github.com/DamonOehlman/detect-browser/blob/546e6f1348375d8a486f21da07b20717267f6c49/src/index.ts#L131C63-L131C63
    return false;
  }

  if (userAgent.match(USER_AGENT_REG_BY_HUMAN)) {
    return false;
  }

  return true;
}
