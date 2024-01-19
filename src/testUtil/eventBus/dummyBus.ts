import { IEventBus, WatchCallback } from "@/eventBus/infra/iEventBus";

export class DummyBus<T> implements IEventBus {
  emittedData: [string, T][] = [];
  immediateReturnObject?: unknown = undefined;

  private watchingEvents = new Map<string, WatchCallback>();

  async open() {}
  close() {}
  on(eventName: string, callback: WatchCallback) {
    this.watchingEvents.set(eventName, callback);
  }

  onOnce<R>(
    _eventName: string,
    _timeoutMs: number,
    _fn: (data: unknown) => Promise<R | undefined>,
  ): Promise<R> {
    if (this.immediateReturnObject) {
      return Promise.resolve(this.immediateReturnObject as R);
    }

    return Promise.resolve(undefined as R);
  }

  async emit(eventName: string, data: T) {
    this.emittedData.push([eventName, data]);
    for (const [key, callback] of this.watchingEvents) {
      if (key === eventName) {
        // call JSON.stringify and parse to emulate file writing and reading
        await callback(JSON.parse(JSON.stringify(data)));
      }
    }
  }
}
