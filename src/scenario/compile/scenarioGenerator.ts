import { Config } from "@/scenario/compile/config";
import { ScenarioBook } from "@/scenario/compile/scenarioBook";
import { Eta } from "eta";
import fs from "fs";
import path from "path";
import * as prettier from "prettier";

const ETA_FILE_NAME = "specFile.eta";

export class ScenarioGenerator {
  constructor(
    private readonly baseDir: string,
    private readonly etaInstance: Eta,
    private readonly config: Config,
  ) {}

  async generate(
    outputFilename: string,
    scenarioBook: ScenarioBook,
  ): Promise<void> {
    const outFile = path.join(this.baseDir, outputFilename);

    const genText = this.generateText(scenarioBook);
    const formatted = await prettier.format(genText, {
      parser: "typescript",
      plugins: ["prettier-plugin-organize-imports"],
    });

    const dir = path.dirname(outFile);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(outFile, formatted);
  }

  generateText(scenarioBook: ScenarioBook): string {
    const res = this.etaInstance.render(ETA_FILE_NAME, {
      scenarioBook: scenarioBook,
      config: this.config,
    });

    return res;
  }
}
