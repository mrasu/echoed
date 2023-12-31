import { IEventBus } from "@/eventBus/infra/iEventBus";

declare global {
  var __ECHOED_BUS__: IEventBus | undefined;
}
