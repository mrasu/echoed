import { EchoedContext } from "@/scenario/gen/common/context";
import { ActArgument, ActResult, Option } from "@/scenario/gen/common/type";

export interface Runner {
  (
    ctx: EchoedContext,
    argument: ActArgument,
    option: Option,
  ): Promise<Record<string, ActResult>>;
}
