import { ActRunner } from "@/scenario/compile/actRunner";
import { Config } from "@/scenario/compile/config";
import {
  RunnerContainer,
  RunnerContainerSchema,
} from "@/scenario/compile/runnerContainer";
import { z } from "zod";

export const ActSchema = RunnerContainerSchema;
export type ActSchema = z.infer<typeof ActSchema>;

export class Act {
  static parse(config: Config, act: ActSchema): Act {
    const runnerContainer = RunnerContainer.parse(config, act);
    const actRunner = new ActRunner(runnerContainer);

    return new Act(actRunner);
  }

  constructor(public readonly runner: ActRunner) {}
}
