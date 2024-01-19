import { createEmptyFile, statSync } from "@/util/file";
import fs from "fs";
import { Mutex } from "async-mutex";
import { neverVisit } from "@/util/never";

export class FileWatcher {
  private readonly file: string;
  private fsWatcher?: fs.FSWatcher;
  private mutex = new Mutex();
  private lastFilePosition = 0;
  private callback?: (addedText: string) => Promise<void>;

  constructor(file: string) {
    this.file = file;
  }

  async open(callback: (_: string) => Promise<void>) {
    const stat = statSync(this.file);
    const position = stat?.size || 0;
    if (!stat) {
      await createEmptyFile(this.file);
    }
    const fsWatcher = fs.watch(this.file, (eventType) => {
      void this.receiveFSEvent(eventType);
    });

    this.fsWatcher = fsWatcher;
    this.lastFilePosition = position;
    this.callback = callback;
  }

  close(): void {
    this.fsWatcher?.close();
  }

  private async receiveFSEvent(eventType: fs.WatchEventType) {
    await this.mutex.runExclusive(async () => {
      switch (eventType) {
        case "rename":
          // Not estimated type but ignore for now.
          break;
        case "change":
          await this.handleFileChanged();
          break;
        default:
          neverVisit("unknown event while watching eventBus", eventType);
      }
    });
  }

  private async handleFileChanged() {
    const text = await this.readChangedText();
    if (!text) return;

    if (this.callback) {
      await this.callback(text);
    }
  }

  private async readChangedText(): Promise<string | undefined> {
    const stat = await fs.promises.stat(this.file);
    if (stat.size <= this.lastFilePosition) {
      return;
    }
    const previousPosition = this.lastFilePosition;
    this.lastFilePosition = stat.size;

    const stream = fs.createReadStream(this.file, {
      start: previousPosition,
      end: stat.size - 1,
      encoding: "utf-8",
    });

    return new Promise<string>((resolve) => {
      const chunks: string[] = [];
      stream.on("readable", () => {
        let chunk;
        while ((chunk = stream.read() as string) !== null) {
          chunks.push(chunk);
        }
      });

      stream.on("end", () => {
        const text = chunks.join("");
        resolve(text);
      });
    });
  }
}
