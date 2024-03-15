import { Comparable } from "@/comparision/comparable";

type PropagationTestConfigType = {
  enabled: boolean;
  ignore: {
    attributes: PropagationTestIgnoreConditionType["attributes"];
    resource: PropagationTestIgnoreConditionType["resource"];
    conditions: PropagationTestIgnoreConditionType[];
  };
};

type PropagationTestIgnoreConditionType = {
  attributes: Map<string, Comparable>;
  resource: {
    attributes: Map<string, Comparable>;
  };
};

export class PropagationTestConfig {
  readonly enabled: boolean;
  readonly ignoreConditions: PropagationTestIgnoreConditionConfig[];

  constructor(t: PropagationTestConfigType) {
    this.enabled = t.enabled;
    this.ignoreConditions = PropagationTestIgnoreConditionConfig.parse(
      t.ignore,
    );
  }
}

export class PropagationTestIgnoreConditionConfig {
  readonly attributes: Map<string, Comparable>;
  readonly resource: {
    attributes: Map<string, Comparable>;
  };

  static parse(
    t: PropagationTestConfigType["ignore"],
  ): PropagationTestIgnoreConditionConfig[] {
    const conditions: PropagationTestIgnoreConditionConfig[] = [];

    for (const attr of t.attributes) {
      conditions.push(
        new PropagationTestIgnoreConditionConfig({
          attributes: new Map([attr]),
          resource: { attributes: new Map() },
        }),
      );
    }
    for (const resourceAttr of t.resource.attributes) {
      conditions.push(
        new PropagationTestIgnoreConditionConfig({
          attributes: new Map(),
          resource: { attributes: new Map([resourceAttr]) },
        }),
      );
    }

    for (const condition of t.conditions) {
      conditions.push(new PropagationTestIgnoreConditionConfig(condition));
    }

    return conditions;
  }

  constructor(t: PropagationTestIgnoreConditionType) {
    this.attributes = t.attributes;
    this.resource = t.resource;
  }
}
