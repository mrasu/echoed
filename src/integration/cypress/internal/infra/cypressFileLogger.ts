import { IFileLogger } from "@/fileLog/iFileLogger";
import { IFile } from "@/fs/IFile";

export interface ICypressFileLogger extends IFileLogger {
  writeToFile(): void;
}

export class CypressFileLogger implements ICypressFileLogger {
  private texts: string[] = [];
  constructor(private file: IFile) {}

  async appendFileLine(text: string): Promise<void> {
    this.texts.push(text);

    return Promise.resolve();
  }

  writeToFile(): void {
    let newText = "";
    for (const text of this.texts) {
      newText += text + "\n";
    }

    cy.writeFile(this.file.path, newText, { flag: "a" });
    this.texts = [];
  }
}
