import { IEventBus } from "@/eventBus/infra/iEventBus";

declare global {
  var __TOBIKURA_BUS__: IEventBus | undefined;
}
