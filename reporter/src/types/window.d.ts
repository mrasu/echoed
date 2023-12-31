import type { IEchoedParam } from "./echoed_param";

declare global {
  interface Window {
    __echoed_param__: IEchoedParam;
  }
}
