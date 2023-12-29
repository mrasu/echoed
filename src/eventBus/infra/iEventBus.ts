export type WatchCallback = (data: any) => void;

export interface IEventBus {
  open(): Promise<void>;
  close(): void;
  on(eventName: string, callback: WatchCallback): void;
  onOnce<T, U>(
    eventName: string,
    timeoutMs: number,
    fn: (data: T) => U | undefined,
  ): Promise<U>;

  emit(eventName: string, data: any): Promise<any>;
}
