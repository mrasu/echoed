import { createEmptyFile, statSync } from "@/util/file";
import fs from "fs";
import { Mutex } from "async-mutex";

export class FileWatcher {
  private readonly file: string;
  private fsWatcher?: fs.FSWatcher;
  private mutex = new Mutex();
  private lastFilePosition = 0;
  private callback?: (addedText: string) => void;

  constructor(file: string) {
    this.file = file;
  }

  async open(callback: (_: string) => void) {
    const stat = statSync(this.file);
    const position = stat?.size || 0;
    if (!stat) {
      await createEmptyFile(this.file);
    }
    const fsWatcher = fs.watch(this.file, (eventType) => {
      this.receiveFSEvent(eventType);
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
          throw new Error(
            `unknown event while watching eventBus: ${eventType}`,
          );
      }
    });
  }

  private async handleFileChanged() {
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

    return new Promise((resolve, reject) => {
      const chunks: string[] = [];
      stream.on("readable", () => {
        let chunk;
        while ((chunk = stream.read()) !== null) {
          chunks.push(chunk as string);
        }
      });

      stream.on("end", () => {
        const text = chunks.join("");
        if (this.callback) {
          this.callback(text);
        }
        resolve(undefined);
      });
    });
  }
}
