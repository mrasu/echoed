import { IFile } from "@/fs/IFile";
import { Config } from "@/scenario/compile/config";
import { InvalidScenarioError } from "@/scenario/compile/invalidScenarioError";
import {
  ScenarioBook,
  ScenarioBookSchema,
} from "@/scenario/compile/scenarioBook";
import { ScenarioYamlSchema } from "@/schema/scenarioYamlSchema";
import { formatZodError } from "@/util/zod";
import yaml from "js-yaml";
import { z } from "zod";

export class ScenarioYamlLoader {
  async load(config: Config, file: IFile): Promise<ScenarioBook> {
    const fileText = await file.read();
    const ymlObject = yaml.load(fileText.toString());
    const scenarioYamlSchema = ScenarioBookSchema.safeParse(ymlObject);

    if (!scenarioYamlSchema.success) {
      throw new InvalidScenarioError(
        `Invalid yaml format: \n${formatZodError(scenarioYamlSchema.error)}`,
      );
    }

    return ScenarioBook.parse(config, scenarioYamlSchema.data);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _typeCheck: z.ZodType<ScenarioYamlSchema> = ScenarioBookSchema;
