import { ActRunner } from "@/scenario/compile/common/actRunner";
import { Config } from "@/scenario/compile/common/config";
import { RawString } from "@/scenario/compile/common/rawString";
import {
  RunnerContainer,
  RunnerContainerSchema,
} from "@/scenario/compile/common/runnerContainer";
import { TsString } from "@/scenario/compile/common/tsString";
import { z } from "zod";

export const ActSchema = z.union([
  RunnerContainerSchema,
  z.strictObject({
    raw: z.string(),
  }),
]);
export type ActSchema = z.infer<typeof ActSchema>;

export class Act {
  static parse(config: Config, act: ActSchema): Act {
    if ("raw" in act) {
      return new Act(undefined, new RawString(act.raw));
    }

    const runnerContainer = RunnerContainer.parse(config, act);
    const actRunner = new ActRunner(runnerContainer);

    return new Act(actRunner);
  }

  constructor(
    public readonly runner?: ActRunner,
    public readonly tsString?: TsString,
  ) {}
}
