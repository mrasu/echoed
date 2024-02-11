import { EchoedFatalError } from "@/echoedFatalError";
import { IFile } from "@/fs/IFile";
import { IFileWatcher } from "@/fs/IFileWatcher";
import { neverVisit } from "@/util/never";
import { Mutex } from "async-mutex";
import fs from "fs";

export class FileWatcher implements IFileWatcher {
  private readonly file: IFile;
  private fsWatcher?: fs.FSWatcher;
  private mutex = new Mutex();
  private lastFilePosition = 0;
  private callback?: (addedText: string) => Promise<void>;

  constructor(file: IFile) {
    this.file = file;
  }

  async open(callback: (_: string) => Promise<void>): Promise<void> {
    const stat = this.file.statSync();
    const position = stat?.size || 0;
    if (!stat) {
      await this.file.createEmptyWithDir();
    }
    const fsWatcher = fs.watch(this.file.path, (eventType) => {
      void this.receiveFSEvent(eventType);
    });

    this.fsWatcher = fsWatcher;
    this.lastFilePosition = position;
    this.callback = callback;
  }

  close(): void {
    this.fsWatcher?.close();
  }

  private async receiveFSEvent(eventType: fs.WatchEventType): Promise<void> {
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

  private async handleFileChanged(): Promise<void> {
    const text = await this.readChangedText();
    if (!text) return;

    if (this.callback) {
      await this.callback(text);
    }
  }

  private async readChangedText(): Promise<string | undefined> {
    const stat = this.file.statSync();
    if (!stat) {
      throw new EchoedFatalError("Watching file disappeared");
    }

    if (stat.size <= this.lastFilePosition) {
      return;
    }
    const previousPosition = this.lastFilePosition;
    this.lastFilePosition = stat.size;

    const stream = fs.createReadStream(this.file.path, {
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
