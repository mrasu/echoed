import { IFileLogger } from "@/fileLog/iFileLogger";

export class NoopLogger implements IFileLogger {
  async appendFileLine(text: string) {
    // noop
  }
}
