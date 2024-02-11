import path from "path";

export class MockFileContents {
  files = new Map<string, string>();

  constructor() {}

  replace(filename: string, content: string): void {
    this.set(filename, content);
  }

  append(filename: string, content: string): void {
    const fileContent = this.get(filename) || "";
    const newContent = fileContent + content;
    this.set(filename, newContent);
  }

  get(filename: string): string | undefined {
    return this.files.get(this.resolve(filename));
  }

  private set(filename: string, content: string): void {
    this.files.set(this.resolve(filename), content);
  }

  private resolve(filename: string): string {
    return path.resolve(filename);
  }
}
