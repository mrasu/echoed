import path from "path";
import fs from "fs";

export class Creator {
  constructor(private cwd: string) {}
  async run(): Promise<void> {
    const dir = path.join(__dirname, "template");
    await fs.promises.cp(dir, this.cwd, { recursive: true });
  }
}
