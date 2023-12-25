import { FileBus } from "@/eventBus/infra/fileBus";

declare global {
  var __TOBIKURA_BUS__: FileBus | undefined;
}
