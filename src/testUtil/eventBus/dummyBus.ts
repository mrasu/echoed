import { EventBus, WatchCallback } from "@/eventBus/infra/eventBus";

type EventData<T> = {
  event: string;
  data: T;
};

export class DummyBus<T> implements EventBus {
  emittedData: EventData<T>[] = [];
  callbacks = new Map<string, WatchCallback[]>();

  on(eventName: string, callback: WatchCallback): void {
    this.callbacks.set(eventName, [callback]);
  }

  onOnce<T>(
    eventName: string,
    timeoutMs: number,
    fn: (data: unknown) => Promise<T | undefined>,
  ): Promise<T> {
    return new Promise((resolve) => {
      this.on(eventName, async (data: unknown): Promise<void> => {
        const res = await fn(data);
        resolve(res as T);

        return Promise.resolve();
      });
    });
  }

  async emit(eventName: string, data: unknown): Promise<void> {
    this.emittedData.push({ event: eventName, data: data as T });
    this.callbacks.get(eventName)?.forEach((callback) => {
      void callback(data);
    });

    return Promise.resolve();
  }
}
