export type WatchCallback = (data: unknown) => Promise<void>;

export interface IEventBus {
  open(): Promise<void>;
  close(): void;
  on(eventName: string, callback: WatchCallback): void;
  onOnce<T>(
    eventName: string,
    timeoutMs: number,
    fn: (data: unknown) => Promise<T | undefined>,
  ): Promise<T>;

  emit(eventName: string, data: unknown): Promise<void>;
}
