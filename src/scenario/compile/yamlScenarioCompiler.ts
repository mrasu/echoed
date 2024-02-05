import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { Logger } from "@/logger";
import { Config } from "@/scenario/compile/config";
import { ScenarioGenerator } from "@/scenario/compile/scenarioGenerator";
import { ScenarioYamlLoader } from "@/scenario/compile/scenarioYamlLoader";
import { buildNoEscapeEta } from "@/util/eta";
import { Eta } from "eta";
import fs from "fs";
import path from "path";

const COMPILE_TEMPLATE_DIR_FROM_ROOT_DIR = "scenario/template";

export class YamlScenarioCompiler {
  private readonly scenarioCompileConfig: Config;
  constructor(
    private readonly echoedRootDir: string,
    private readonly compileConfig: ScenarioCompileConfig,
  ) {
    this.scenarioCompileConfig = Config.parse(this.compileConfig);
  }

  async compileAll(cwd: string): Promise<void> {
    const filenames = await this.getYmlRecursively(
      this.compileConfig.yamlDir,
      "",
    );
    const etaInstance = buildNoEscapeEta(
      path.join(this.echoedRootDir, COMPILE_TEMPLATE_DIR_FROM_ROOT_DIR),
    );

    if (this.compileConfig.cleanOutDir) {
      await this.cleanOutDir(cwd);
    }

    for (const filename of filenames) {
      try {
        await this.compile(etaInstance, filename);
      } catch (e) {
        Logger.error("Failed to compile", filename);
        throw e;
      }
    }
  }

  private async getYmlRecursively(
    baseDir: string,
    currentDir: string,
  ): Promise<string[]> {
    const foundPaths: string[] = [];
    const searchingDir = path.join(baseDir, currentDir);
    const filenames = await fs.promises.readdir(searchingDir);
    for (const filename of filenames) {
      const filepath = path.join(searchingDir, filename);
      const stat = await fs.promises.stat(filepath);
      if (stat.isDirectory()) {
        const subdirFiles = await this.getYmlRecursively(
          baseDir,
          path.join(currentDir, filename),
        );
        foundPaths.push(...subdirFiles);
      } else if (filename.endsWith(".yml")) {
        const foundPath = path.join(currentDir, filename);
        foundPaths.push(foundPath);
      }
    }

    return foundPaths;
  }

  private async cleanOutDir(cwd: string): Promise<void> {
    const fullOutDir = path.resolve(this.compileConfig.outDir);
    const fullCwd = path.resolve(cwd);
    if (!fullOutDir.startsWith(fullCwd)) {
      throw new Error(
        `outDir must be under cwd if cleaning directory for safety. outDir: ${this.compileConfig.outDir}`,
      );
    }

    const outDir = this.compileConfig.outDir;
    await fs.promises.rm(outDir, { recursive: true, force: true });
  }

  async compile(etaInstance: Eta, ymlFilename: string): Promise<void> {
    const ymlPath = path.join(this.compileConfig.yamlDir, ymlFilename);
    const scenarioLoader = new ScenarioYamlLoader();
    const scenarioBook = await scenarioLoader.load(
      this.scenarioCompileConfig,
      ymlPath,
    );

    const scenarioGenerator = new ScenarioGenerator(
      this.compileConfig.outDir,
      etaInstance,
      this.scenarioCompileConfig,
    );

    const outputFilename = this.toOutputFilename(ymlFilename);
    await scenarioGenerator.generate(outputFilename, scenarioBook);
  }

  private toOutputFilename(ymlFilename: string): string {
    return ymlFilename
      .replace(/\.[^/.]+$/, ".test.ts")
      .replace(path.dirname(this.compileConfig.yamlDir), "");
  }
}
