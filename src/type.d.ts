import { Server } from "@/server";

declare global {
  var __SERVER__: Server;
}
