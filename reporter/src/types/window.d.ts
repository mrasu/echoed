import type { ITobikuraParam } from "./tobikura_param";

declare global {
  interface Window {
    __tobikura_param__: ITobikuraParam;
  }
}
