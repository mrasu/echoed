import fs from "fs";
import { appendFileLine, createEmptyFile } from "@/util/file";
import { Logger } from "@/logger";
import { FileWatcher } from "@/eventBus/infra/watcher";

type WatchCallback = (data: any) => void;

export class FileBus {
  private readonly file: string;
  private watcher?: FileWatcher;

  private watchingEvents: Map<string, WatchCallback[]> = new Map();

  constructor(file: string) {
    this.file = file;
  }

  async open() {
    const watcher = new FileWatcher(this.file);
    await watcher.open((text) => {
      this.handleTextAdded(text);
    });

    this.watcher = watcher;
  }

  private handleTextAdded(text: string) {
    const lines = text.split("\n");
    for (const line of lines) {
      if (line === "") {
        continue;
      }

      let data: any;
      try {
        data = JSON.parse(line);
      } catch (error) {
        Logger.warn("failed to parse eventBus line", error, line);
        continue;
      }
      const event = data.event;

      const callbacks = this.watchingEvents.get(event);
      callbacks?.forEach((callback) => {
        callback(data.data);
      });
    }
  }

  public close(): void {
    this.watcher?.close();
    this.watchingEvents = new Map();
  }

  public on(eventName: string, callback: WatchCallback): void {
    const callbacks = this.watchingEvents.get(eventName) || [];
    callbacks.push(callback);
    this.watchingEvents.set(eventName, callbacks);
  }

  /**
   * start `on` and stop when something is returned from callback.
   *
   * @param eventName
   * @param timeoutMs
   * @param fn
   */
  public async onOnce<T, U>(
    eventName: string,
    timeoutMs: number,
    fn: (data: T) => U | undefined,
  ): Promise<U> {
    return new Promise((resolve, reject) => {
      const callback = (data: any) => {
        const res = fn(data as T);
        if (!res) {
          return;
        }

        clearTimeout(timeoutId);
        this.off(eventName, callback);
        resolve(res);
      };

      const timeoutId = setTimeout(() => {
        this.off(eventName, callback);
        reject(new Error("timeout"));
      }, timeoutMs);

      this.on(eventName, callback);
    });
  }

  off(eventName: string, callback: (data: any) => void): void {
    const callbacks = this.watchingEvents.get(eventName);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index === -1) {
      return;
    }
    callbacks.splice(index, 1);
  }

  public async emit(eventName: string, data: any) {
    if (!fs.existsSync(this.file)) {
      await createEmptyFile(this.file);
    }

    const eventData = JSON.stringify({ event: eventName, data });
    await appendFileLine(this.file, eventData);
  }
}
