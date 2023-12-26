import { Comparable } from "@/comparision/comparable";

type PropagationTestConfigType = {
  enabled: boolean;
  ignore: {
    attributes: Map<string, Comparable>;
    resource: {
      attributes: Map<string, Comparable>;
    };
  };
};

export class PropagationTestConfig {
  readonly enabled: boolean;
  readonly ignoreConfig: PropagationTestIgnoreConfig;

  constructor(t: PropagationTestConfigType) {
    this.enabled = t.enabled;
    this.ignoreConfig = new PropagationTestIgnoreConfig(t.ignore);
  }
}

class PropagationTestIgnoreConfig {
  readonly attributes: Map<string, Comparable>;
  readonly resource: {
    attributes: Map<string, Comparable>;
  };

  constructor(t: PropagationTestConfigType["ignore"]) {
    this.attributes = t.attributes;
    this.resource = t.resource;
  }
}
