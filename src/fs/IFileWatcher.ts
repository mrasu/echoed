export interface IFileWatcher {
  open(callback: (text: string) => Promise<void>): Promise<void>;
  close(): void;
}
