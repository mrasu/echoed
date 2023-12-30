import { IFileLogger } from "@/fileLog/iFileLogger";
import { appendFileLine } from "@/util/file";

export class FileLogger implements IFileLogger {
  constructor(private filepath: string) {}

  async appendFileLine(text: string) {
    await appendFileLine(this.filepath, text);
  }
}
