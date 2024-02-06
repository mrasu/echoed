import { EventBus } from "@/eventBus/infra/eventBus";

declare global {
  // eslint-disable-next-line no-var
  var __ECHOED_BUS__: EventBus | undefined;
}
