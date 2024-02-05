import { EchoedAssertContext } from "@/scenario/gen/common/context";
import { AssertArgument, Option } from "@/scenario/gen/common/type";

export interface Asserter {
  (
    ctx: EchoedAssertContext,

    /**
     * The first argument for asserter. Typically, it's the actual value.
     */
    x: AssertArgument,

    /**
     * The second argument for asserter. Typically, it's the expected value.
     */
    y: AssertArgument,
    option: Option,
  ): Promise<void>;
}
