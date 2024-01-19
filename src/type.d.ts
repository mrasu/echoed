import { IEventBus } from "@/eventBus/infra/iEventBus";

declare global {
  // eslint-disable-next-line no-var
  var __ECHOED_BUS__: IEventBus | undefined;
}
