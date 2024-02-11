import { InvalidConfigError } from "@/config/invalidConfigError";
import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { IFile } from "@/fs/IFile";
import { IDirectory } from "@/fs/iDirectory";
import { Logger } from "@/logger";
import { Config } from "@/scenario/compile/config";
import { ScenarioGenerator } from "@/scenario/compile/scenarioGenerator";
import { ScenarioYamlLoader } from "@/scenario/compile/scenarioYamlLoader";
import { buildNoEscapeEta } from "@/util/eta";
import { Eta } from "eta";

const COMPILE_TEMPLATE_DIR_FROM_ROOT_DIR = "scenario/template";

export class YamlScenarioCompiler {
  private readonly scenarioCompileConfig: Config;
  constructor(
    private readonly echoedRootDir: IDirectory,
    private readonly compileConfig: ScenarioCompileConfig,
  ) {
    this.scenarioCompileConfig = Config.parse(this.compileConfig);
  }

  async compileAll(cwd: IDirectory): Promise<void> {
    const ymlFiles = await this.getYmlRecursively(this.compileConfig.yamlDir);
    const etaInstance = buildNoEscapeEta(
      this.echoedRootDir.newDir(COMPILE_TEMPLATE_DIR_FROM_ROOT_DIR),
    );

    if (this.compileConfig.cleanOutDir) {
      await this.cleanOutDir(cwd);
    }

    for (const ymlFile of ymlFiles) {
      try {
        await this.compile(etaInstance, ymlFile);
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

  private async cleanOutDir(cwd: IDirectory): Promise<void> {
    const fullOutDir = this.compileConfig.outDir.resolve();
    const fullCwd = cwd.resolve();
    if (!fullOutDir.startsWith(fullCwd)) {
      throw new InvalidConfigError(
        `outDir must be under cwd if cleaning directory for safety. outDir: ${this.compileConfig.outDir.path}`,
      );
    }

    await this.compileConfig.outDir.rm();
  }

  async compile(etaInstance: Eta, ymlFile: IFile): Promise<void> {
    const scenarioLoader = new ScenarioYamlLoader();
    const scenarioBook = await scenarioLoader.load(
      this.scenarioCompileConfig,
      ymlFile,
    );

    const scenarioGenerator = new ScenarioGenerator(
      etaInstance,
      this.scenarioCompileConfig,
    );

    const outputFilename = this.toOutputFilename(ymlFile);
    await scenarioGenerator.generate(outputFilename, scenarioBook);
  }

  private toOutputFilename(ymlFile: IFile): IFile {
    const outFile = ymlFile.path
      .replace(/\.[^/.]+$/, ".test.ts")
      .replace(this.compileConfig.yamlDir.path, "");

    return this.compileConfig.outDir.newFile(outFile);
  }
}
