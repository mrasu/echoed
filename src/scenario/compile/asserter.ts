import { Config } from "@/scenario/compile/config";
import { InvalidScenarioError } from "@/scenario/compile/invalidScenarioError";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const AsserterSchema = z.record(z.tuple([JsonSchema, JsonSchema]));
export type AsserterSchema = z.infer<typeof AsserterSchema>;

export class Asserter {
  static parse(config: Config, schema: AsserterSchema): Asserter {
    const asserterNames = Object.keys(schema);
    if (asserterNames.length == 0) {
      throw new InvalidScenarioError("No asserter found in assert");
    } else if (asserterNames.length > 1) {
      throw new InvalidScenarioError(
        `Multiple asserters found in assert: ${asserterNames.join(", ")}`,
      );
    }

    const asserterName = asserterNames[0];
    const [x, y] = schema[asserterName];
    if (!config.plugin.hasAsserter(asserterName)) {
      throw new InvalidScenarioError(
        `Unregistered asserter found. Make sure the asserter is registered in the configuration: ${asserterName}`,
      );
    }

    return new Asserter(asserterName, TsVariable.parse(x), TsVariable.parse(y));
  }

  constructor(
    public readonly name: string,
    public readonly x: TsVariable,
    public readonly y: TsVariable,
  ) {}
}
