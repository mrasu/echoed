import fs from "fs";
import path from "path";

export class Creator {
  constructor(
    private createEchoedRootDir: string,
    private cwd: string,
  ) {}

  async createJestExample(): Promise<void> {
    const dir = path.join(this.createEchoedRootDir, "template", "jest");
    await fs.promises.cp(dir, this.cwd, { recursive: true });
  }
}
