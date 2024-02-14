import { EchoedContext } from "@/scenario/gen/common/context";
import {
  Option,
  RunnerArgument,
  RunnerResult,
} from "@/scenario/gen/common/type";

export interface Runner {
  (
    ctx: EchoedContext,
    argument: RunnerArgument,
    option: Option,
  ): Promise<Record<string, RunnerResult>>;
}
