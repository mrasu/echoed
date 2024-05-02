import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { IFile } from "@/fs/IFile";
import { IDirectory } from "@/fs/iDirectory";
import { AsserterConfig } from "@/scenario/compile/common/asserterConfig";
import { CommonPluginConfig } from "@/scenario/compile/common/commonPluginConfig";
import { Config } from "@/scenario/compile/common/config";
import { InvalidScenarioError } from "@/scenario/compile/common/invalidScenarioError";
import { RunnerConfig } from "@/scenario/compile/common/runnerConfig";
import { ScenarioBase } from "@/scenario/compile/common/scenarioBase";
import { ScenarioBookBase } from "@/scenario/compile/common/scenarioBookBase";
import { StepBase } from "@/scenario/compile/common/stepBase";
import {
  ScenarioBaseType,
  ScenarioBookBaseType,
} from "@/scenario/compile/common/typeUtil";
import { buildNoEscapeEta } from "@/util/eta";
import { formatZodError } from "@/util/zod";
import { Eta } from "eta";
import yaml from "js-yaml";
import * as prettier from "prettier";
import { ZodError } from "zod";

export abstract class ScenarioCompiler<
  T extends ScenarioBookBase<U, V>,
  U extends ScenarioBase<V> = ScenarioBookBaseType<T>,
  V extends StepBase = ScenarioBaseType<U>,
> {
  protected readonly scenarioCompileConfig: Config;
  protected readonly etaInstance: Eta;

  protected constructor(
    private readonly echoedRootDir: IDirectory,
    private readonly compileConfig: ScenarioCompileConfig,
    defaultRunners: RunnerConfig[],
    defaultAsserters: AsserterConfig[],
    defaultCommonPlugins: CommonPluginConfig[],
    etaTemplateDirFromRootDir: string,
    private readonly etaRootFileName: string,
  ) {
    this.scenarioCompileConfig = Config.parse(
      this.compileConfig,
      defaultRunners,
      defaultAsserters,
      defaultCommonPlugins,
    );

    this.etaInstance = buildNoEscapeEta(
      this.echoedRootDir.newDir(etaTemplateDirFromRootDir),
    );
  }

  async compile(ymlFile: IFile, outputFile: IFile): Promise<void> {
    const scenarioBook = await this.buildScenarioBook(ymlFile);
    return this.generate(outputFile, scenarioBook);
  }

  async buildScenarioBook(file: IFile): Promise<T> {
    const fileText = await file.read();
    const ymlObject = yaml.load(fileText.toString());

    const parsed = this.parseScenarioBook(ymlObject);
    if ("success" in parsed) {
      throw new InvalidScenarioError(
        `Invalid yaml format: \n${formatZodError(parsed.error)}`,
      );
    }

    return parsed;
  }

  protected abstract parseScenarioBook(
    ymlObject: unknown,
  ): T | { success: false; error: ZodError };

  private async generate(outFile: IFile, scenarioBook: T): Promise<void> {
    const genText = this.generateText(scenarioBook);
    const formatted = await this.formatWithPrettier(genText);

    await outFile.ensureDir();
    await outFile.write(formatted);
  }

  private async formatWithPrettier(text: string): Promise<string> {
    try {
      return await prettier.format(text, {
        parser: "typescript",
        plugins: ["prettier-plugin-organize-imports"],
      });
    } catch (e) {
      console.error(`Failed to format text with prettier:
${text}
`);
      throw e;
    }
  }

  private generateText(scenarioBook: T): string {
    const res = this.etaInstance.render(this.etaRootFileName, {
      scenarioBook: scenarioBook,
      config: this.scenarioCompileConfig,
    });

    return res;
  }
}
