import { IFileLogger } from "@/fileLog/iFileLogger";

export class MockFileLogger implements IFileLogger {
  texts: string[] = [];

  async appendFileLine(text: string): Promise<void> {
    this.texts.push(text);
    return Promise.resolve();
  }
}
