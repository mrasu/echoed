import { IEventBus, WatchCallback } from "@/eventBus/infra/iEventBus";

export class DummyBus implements IEventBus {
  emittedData: [string, any][] = [];
  immediateReturnObject: any = undefined;

  private watchingEvents = new Map<string, WatchCallback>();

  async open() {}
  close() {}
  on(eventName: string, callback: WatchCallback) {
    this.watchingEvents.set(eventName, callback);
  }
  async onOnce<T, U>(
    eventName: string,
    timeoutMs: number,
    fn: (data: T) => U | undefined,
  ): Promise<U> {
    if (this.immediateReturnObject) {
      return this.immediateReturnObject as U;
    }

    return undefined as U;
  }
  async emit(eventName: string, data: any) {
    this.emittedData.push([eventName, data]);
    for (const [key, callback] of this.watchingEvents) {
      if (key === eventName) {
        // call JSON.stringify and parse to emulate file writing and reading
        callback(JSON.parse(JSON.stringify(data)));
      }
    }
  }
}
