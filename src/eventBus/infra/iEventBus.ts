export type WatchCallback = (data: unknown) => void;

export interface IEventBus {
  open(): Promise<void>;
  close(): void;
  on(eventName: string, callback: WatchCallback): void;
  onOnce<T>(
    eventName: string,
    timeoutMs: number,
    fn: (data: unknown) => T | undefined,
  ): Promise<T>;

  emit(eventName: string, data: any): Promise<any>;
}
