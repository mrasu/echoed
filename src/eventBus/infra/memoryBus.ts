import { EventBus, WatchCallback } from "@/eventBus/infra/eventBus";
import { ErrorMessage } from "@/type/common";

const TIMEOUT_ERROR_MESSAGE: ErrorMessage = { error: true, reason: "timeout" };

export class MemoryBus implements EventBus {
  private watchingEvents: Map<string, WatchCallback[]> = new Map();

  on(eventName: string, callback: WatchCallback): void {
    const callbacks = this.watchingEvents.get(eventName) || [];
    callbacks.push(callback);
    this.watchingEvents.set(eventName, callbacks);
  }

  onOnce<T>(
    eventName: string,
    timeoutMs: number,
    fn: (data: unknown) => Promise<T | undefined>,
  ): Promise<T | ErrorMessage> {
    return new Promise((resolve) => {
      const callback = async (data: unknown): Promise<void> => {
        const res = await fn(data);
        if (!res) {
          return;
        }

        clearTimeout(timeoutId);
        this.off(eventName, callback);
        resolve(res);
      };

      const timeoutId = setTimeout(() => {
        this.off(eventName, callback);
        resolve(TIMEOUT_ERROR_MESSAGE);
      }, timeoutMs);

      this.on(eventName, callback);
    });
  }

  off(eventName: string, callback: WatchCallback): void {
    const callbacks = this.watchingEvents.get(eventName);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index === -1) {
      return;
    }
    callbacks.splice(index, 1);
  }

  emit(eventName: string, data: unknown): Promise<void> {
    // Convert to JSON and back to simulate storing data as string format
    const eventData = JSON.parse(JSON.stringify(data)) as unknown;

    for (const callback of this.watchingEvents.get(eventName) || []) {
      void callback(eventData);
    }

    return Promise.resolve();
  }
}
