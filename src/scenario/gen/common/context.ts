import { ActResult } from "@/scenario/gen/common/type";

type EchoedContextBase = {
  scenarioName: string;

  /**
   * index starts from 0
   */
  currentStepIndex: number;
};

export type EchoedArrangeContext = EchoedContextBase & {
  kind: "arrange";

  /**
   * index starts from 0
   */
  currentArrangeIndex: number;
};

export type EchoedActContext = EchoedContextBase & {
  kind: "act";
};

export type EchoedAssertContext = EchoedContextBase & {
  kind: "assert";
  actResult: ActResult;
};

export type EchoedContext = EchoedActContext | EchoedArrangeContext;
