import { IFileLogger } from "@/fileLog/iFileLogger";
import { appendFileLine } from "@/util/file";

export class FileLogger implements IFileLogger {
  constructor(private filepath: string) {}

  async appendFileLine(text: string): Promise<void> {
    await appendFileLine(this.filepath, text);
  }
}
