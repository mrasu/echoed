import { TobikuraSpan } from "./../type/tobikuraSpan";
import { opentelemetry } from "./../generated/otelpbj";
import { isUserAgentInternalProgram } from "./../util/ua";

export type PropagationTestConfigType = {
  enabled?: boolean;
  ignore?: {
    attributes?: Record<string, string | boolean | number>;
    resource?: {
      attributes?: Record<string, string | boolean | number>;
    };
  };
};

export class PropagationTestConfig {
  readonly enabled: boolean;
  readonly ignoreConfig?: PropagationTestIgnoreConfig;

  constructor(t?: PropagationTestConfigType) {
    this.enabled = t?.enabled === undefined ? true : t.enabled;
    this.ignoreConfig = new PropagationTestIgnoreConfig(t?.ignore);
  }
}

class PropagationTestIgnoreConfig {
  readonly attributes?: Record<string, string | boolean | number>;
  readonly resource?: {
    attributes?: Record<string, string | boolean | number>;
  };

  constructor(t?: PropagationTestConfigType["ignore"]) {
    this.attributes = t?.attributes;
    this.resource = t?.resource;
  }
}
