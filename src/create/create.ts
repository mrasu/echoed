import fs from "fs";
import path from "path";

export class Creator {
  constructor(private cwd: string) {}
  async run(): Promise<void> {
    const dir = path.join(__dirname, "template");
    await fs.promises.cp(dir, this.cwd, { recursive: true });
  }
}
