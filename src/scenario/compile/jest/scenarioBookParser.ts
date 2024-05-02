import { Config } from "@/scenario/compile/common/config";
import {
  ScenarioBook,
  ScenarioBookSchema,
} from "@/scenario/compile/jest/scenarioBook";
import { ZodError } from "zod";

export class ScenarioBookParser {
  constructor(private config: Config) {}

  parse(
    ymlObject: unknown,
  ): ScenarioBook | { success: false; error: ZodError } {
    const scenarioYamlSchema = ScenarioBookSchema.safeParse(ymlObject);

    if (!scenarioYamlSchema.success) {
      return scenarioYamlSchema;
    }

    return ScenarioBook.parse(this.config, scenarioYamlSchema.data);
  }
}
