export interface IFileLogger {
  appendFileLine(text: string): Promise<void>;
}
