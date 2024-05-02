import { InvalidConfigError } from "@/config/invalidConfigError";
import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { ScenarioCompileTargetConfig } from "@/config/scenarioCompileTargetConfig";
import { IFile } from "@/fs/IFile";
import { IDirectory } from "@/fs/iDirectory";
import { Logger } from "@/logger";
import { buildCompiler } from "@/scenario/compile/compilerBuilder";

export class YamlScenarioCompiler {
  constructor(
    private readonly echoedRootDir: IDirectory,
    private readonly compileConfig: ScenarioCompileConfig,
  ) {}

  async compileAll(cwd: IDirectory): Promise<void> {
    for (const target of this.compileConfig.targets) {
      await this.compileTarget(cwd, target);
    }
  }

  private async compileTarget(
    cwd: IDirectory,
    target: ScenarioCompileTargetConfig,
  ): Promise<void> {
    const ymlFiles = await this.getYmlRecursively(target.yamlDir);

    if (this.compileConfig.cleanOutDir) {
      await this.cleanOutDir(cwd, target.outDir);
    }

    const compiler = buildCompiler(
      target,
      this.echoedRootDir,
      this.compileConfig,
    );

    for (const ymlFile of ymlFiles) {
      try {
        const outputFile = this.toOutputFile(target, ymlFile);
        await compiler.compile(ymlFile, outputFile);
      } catch (e) {
        Logger.error("Failed to compile", ymlFile.path);
        throw e;
      }
    }
  }

  private async getYmlRecursively(currentDir: IDirectory): Promise<IFile[]> {
    const foundPaths: IFile[] = [];
    const files = await currentDir.readdir();
    for (const file of files) {
      const stat = file.statSync();
      if (!stat) {
        continue;
      }

      if (stat.isDirectory()) {
        const subdirFiles = await this.getYmlRecursively(file.toDir());
        foundPaths.push(...subdirFiles);
      } else if (file.path.endsWith(".yml")) {
        foundPaths.push(file);
      }
    }

    return foundPaths;
  }

  private async cleanOutDir(
    cwd: IDirectory,
    outDir: IDirectory,
  ): Promise<void> {
    const fullOutDir = outDir.resolve();
    const fullCwd = cwd.resolve();
    if (!fullOutDir.startsWith(fullCwd)) {
      throw new InvalidConfigError(
        `outDir must be under cwd if cleaning directory for safety. outDir: ${outDir.path}`,
      );
    }

    await outDir.rm();
  }

  private toOutputFile(
    target: ScenarioCompileTargetConfig,
    ymlFile: IFile,
  ): IFile {
    const outFile = ymlFile.path
      .replace(/\.[^/.]+$/, ".test.ts")
      .replace(target.yamlDir.path, "");

    return target.outDir.newFile(outFile);
  }
}
