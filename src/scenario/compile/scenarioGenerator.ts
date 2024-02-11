import { IFile } from "@/fs/IFile";
import { Config } from "@/scenario/compile/config";
import { ScenarioBook } from "@/scenario/compile/scenarioBook";
import { Eta } from "eta";
import * as prettier from "prettier";

const ETA_FILE_NAME = "specFile.eta";

export class ScenarioGenerator {
  constructor(
    private readonly etaInstance: Eta,
    private readonly config: Config,
  ) {}

  async generate(outFile: IFile, scenarioBook: ScenarioBook): Promise<void> {
    const genText = this.generateText(scenarioBook);
    const formatted = await prettier.format(genText, {
      parser: "typescript",
      plugins: ["prettier-plugin-organize-imports"],
    });

    await outFile.ensureDir();
    await outFile.write(formatted);
  }

  generateText(scenarioBook: ScenarioBook): string {
    const res = this.etaInstance.render(ETA_FILE_NAME, {
      scenarioBook: scenarioBook,
      config: this.config,
    });

    return res;
  }
}
