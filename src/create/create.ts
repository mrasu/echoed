import path from "path";
import fs from "fs";

export class Creator {
  constructor(private cwd: string) {}
  async run() {
    const dir = path.join(__dirname, "template");
    fs.cpSync(dir, this.cwd, { recursive: true });
  }
}
