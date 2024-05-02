import fs from "fs";
import path from "path";

export const TEMPLATES = [
  "jest",
  "jest-no-otel",
  "playwright",
  "playwright-no-otel",
  "cypress",
] as const;
export type TEMPLATE = (typeof TEMPLATES)[number];

const INSTRUCTION_DIR = ".instruction";
const INSTRUCTION_COPY_JSON_FILE = "copy.json";

type CopyInstruction = {
  from: string | undefined;
};

export class Creator {
  constructor(
    private createEchoedRootDir: string,
    private cwd: string,
  ) {}

  async create(template: TEMPLATE): Promise<void> {
    const dir = this.toTemplatePath(template);

    await this.runInstruction(dir);

    await this.cp(dir);

    await this.rmInstructionDir();
  }

  private toTemplatePath(template: string): string {
    return path.join(this.createEchoedRootDir, "template", template);
  }

  private async runInstruction(templateDir: string): Promise<void> {
    const instructionDir = this.toInstructionDir(templateDir);
    const hasInstruction = fs.existsSync(instructionDir);
    if (!hasInstruction) return;

    await this.runCopyInstruction(instructionDir);
  }

  private async runCopyInstruction(instructionDir: string): Promise<void> {
    const copyInstructionPath = path.join(
      instructionDir,
      INSTRUCTION_COPY_JSON_FILE,
    );
    const hasCopyInstruction = fs.existsSync(copyInstructionPath);
    if (!hasCopyInstruction) return;

    const copyInstructionJson = fs.readFileSync(copyInstructionPath, "utf-8");
    const copyInstruction = JSON.parse(copyInstructionJson) as CopyInstruction;
    if (copyInstruction.from) {
      const copyFrom = this.toTemplatePath(copyInstruction.from);
      await this.runInstruction(copyFrom);

      await this.cp(copyFrom);
    }
  }

  private async cp(from: string): Promise<void> {
    await fs.promises.cp(from, this.cwd, { recursive: true });
  }

  private async rmInstructionDir(): Promise<void> {
    const instructionDir = this.toInstructionDir(this.cwd);

    const hasInstruction = fs.existsSync(instructionDir);
    if (!hasInstruction) return;

    await fs.promises.rm(instructionDir, { recursive: true });
  }

  private toInstructionDir(dir: string): string {
    return path.join(dir, INSTRUCTION_DIR);
  }
}
