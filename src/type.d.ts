import { Server } from "@/server";
import { FileBus } from "@/eventBus/infra/fileBus";

declare global {
  var __SERVER__: Server;
  var __BUS__: FileBus | undefined;
}
