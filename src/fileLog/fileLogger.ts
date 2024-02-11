import { IFileLogger } from "@/fileLog/iFileLogger";
import { IFile } from "@/fs/IFile";

export class FileLogger implements IFileLogger {
  constructor(private file: IFile) {}

  async appendFileLine(text: string): Promise<void> {
    await this.file.appendLine(text);
  }
}
