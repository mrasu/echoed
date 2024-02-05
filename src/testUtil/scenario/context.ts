import {
  EchoedActContext,
  EchoedAssertContext,
} from "@/scenario/gen/common/context";

export const buildEchoedActContext = (): EchoedActContext => {
  return { kind: "act", scenarioName: "scenario", currentStepIndex: 0 };
};

export const buildEchoedAssertContext = (): EchoedAssertContext => {
  return {
    kind: "assert",
    scenarioName: "scenario",
    currentStepIndex: 0,
    actResult: {},
  };
};
