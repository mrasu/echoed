import type { IEchoedParam } from "@shared/type/echoedParam";

declare global {
  interface Window {
    __echoed_param__: IEchoedParam;
  }
}
