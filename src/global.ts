export function setBusIdToGlobalThis(busId: string): void {
  globalThis.__ECHOED_BUS_ID__ = busId;
}

export function getBusIdFromGlobalThis(): string | undefined {
  return globalThis.__ECHOED_BUS_ID__;
}

export function deleteBusIdFromGlobalThis(): void {
  delete globalThis.__ECHOED_BUS_ID__;
}
