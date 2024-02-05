import fs from "fs";
import path from "path";

export class Creator {
  constructor(
    private echoedRootDir: string,
    private cwd: string,
  ) {}

  async run(): Promise<void> {
    const dir = path.join(this.echoedRootDir, "create", "template");
    await fs.promises.cp(dir, this.cwd, { recursive: true });
  }
}
