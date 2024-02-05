import { FileWatcher } from "@/eventBus/infra/fileWatcher";
import { IEventBus, WatchCallback } from "@/eventBus/infra/iEventBus";
import { Logger } from "@/logger";
import { appendFileLine, createEmptyFile } from "@/util/file";
import fs from "fs";
import { z } from "zod";

const eventData = z.object({
  event: z.string(),
  data: z.unknown(),
});

export class FileBus implements IEventBus {
  private readonly file: string;
  private watcher?: FileWatcher;

  private watchingEvents: Map<string, WatchCallback[]> = new Map();

  constructor(file: string) {
    this.file = file;
  }

  async open(): Promise<void> {
    const watcher = new FileWatcher(this.file);
    await watcher.open(async (text) => {
      await this.handleTextAdded(text);
    });

    this.watcher = watcher;
  }

  private async handleTextAdded(text: string): Promise<void> {
    const lines = text.split("\n");
    for (const line of lines) {
      if (line === "") {
        continue;
      }

      let data: z.infer<typeof eventData>;
      try {
        data = eventData.parse(JSON.parse(line));
      } catch (error) {
        Logger.warn("failed to parse eventBus line", error, line);
        continue;
      }
      const event = data.event;

      const callbacks = this.watchingEvents.get(event);
      if (!callbacks) return;

      await Promise.all(
        callbacks?.map(async (callback) => {
          await callback(data.data);
        }),
      );
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
  public async onOnce<U>(
    eventName: string,
    timeoutMs: number,
    fn: (data: unknown) => Promise<U | undefined>,
  ): Promise<U> {
    return new Promise((resolve, reject) => {
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
        reject(new Error("timeout"));
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

  public async emit(eventName: string, data: unknown): Promise<void> {
    if (!fs.existsSync(this.file)) {
      await createEmptyFile(this.file);
    }

    const eventData = JSON.stringify({ event: eventName, data });
    await appendFileLine(this.file, eventData);
  }
}
