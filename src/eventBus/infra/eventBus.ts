import { ErrorMessage } from "@/type/common";

export type WatchCallback = (data: unknown) => Promise<void>;

export interface EventBus {
  on(eventName: string, callback: WatchCallback): void;
  onOnce<T>(
    eventName: string,
    timeoutMs: number,
    fn: (data: unknown) => Promise<T | undefined>,
  ): Promise<T | ErrorMessage>;

  emit(eventName: string, data: unknown): Promise<void>;
}
