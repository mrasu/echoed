import { HookContext } from "@/scenario/gen/internal/common/hookContext";
import { ScenarioContext } from "@/scenario/gen/internal/common/scenarioContext";
import { BoundVariables, Option } from "@/scenario/gen/internal/common/type";

const ORDERED_HOOK_TYPES = [
  "beforeAll",
  "beforeEach",
  "afterEach",
  "afterAll",
] as const;

type HookType = (typeof ORDERED_HOOK_TYPES)[number];

export class ScenarioBookContext {
  hookBoundVariables = {
    beforeAll: {} as BoundVariables,
    afterAll: {} as BoundVariables,
    beforeEach: {} as BoundVariables,
    afterEach: {} as BoundVariables,
  };

  private readonly defaultRunnerOptions = new Map<string, Option>();
  private readonly defaultAsserterOptions = new Map<string, Option>();

  async runHook(
    type: HookType,
    fn: (_: HookContext) => Promise<void>,
  ): Promise<void> {
    const hookContext = new HookContext(this.getHookBoundVariablesFor(type));

    await fn(hookContext);

    const newBoundVariables = hookContext.result.newBoundVariables;
    this.hookBoundVariables[type] = {
      ...this.hookBoundVariables[type],
      ...newBoundVariables,
    };
  }

  clearHookBoundVariablesFor(type: HookType): void {
    this.hookBoundVariables[type] = {};
  }

  private getHookBoundVariablesFor(targetType: HookType): Record<string, any> {
    const types: HookType[] = [];
    for (const type of ORDERED_HOOK_TYPES) {
      types.push(type);
      if (type === targetType) {
        break;
      }
    }

    return this.getHookBoundVariablesForTypes(types);
  }

  getHookBoundVariablesForStep(): Record<string, any> {
    return this.getHookBoundVariablesForTypes(["beforeAll", "beforeEach"]);
  }

  private getHookBoundVariablesForTypes(types: HookType[]): BoundVariables {
    let boundVariables: BoundVariables = {};
    for (const type of types) {
      boundVariables = {
        ...boundVariables,
        ...this.hookBoundVariables[type],
      };
    }

    return boundVariables;
  }

  newScenarioContext(scenarioName: string): ScenarioContext {
    return new ScenarioContext(scenarioName);
  }

  setDefaultRunnerOption(allOptions: Record<string, Option>): void {
    this.defaultRunnerOptions.clear();

    for (const [runnerName, option] of Object.entries(allOptions)) {
      this.defaultRunnerOptions.set(runnerName, option);
    }
  }

  overrideDefaultRunnerOption(
    runnerName: string,
    option: Record<string, unknown>,
  ): void {
    this.defaultRunnerOptions.set(runnerName, option);
  }

  buildRunnerOption(runnerName: string, options: Option): Option {
    const defaultOption = this.defaultRunnerOptions.get(runnerName);
    if (!defaultOption) return options;

    return {
      ...defaultOption,
      ...options,
    };
  }

  setDefaultAsserterOption(allOptions: Record<string, Option>): void {
    this.defaultAsserterOptions.clear();

    for (const [asserterName, option] of Object.entries(allOptions)) {
      this.defaultAsserterOptions.set(asserterName, option);
    }
  }

  buildAsserterOption(asserterName: string): Option {
    const defaultOption = this.defaultAsserterOptions.get(asserterName);
    if (!defaultOption) return {};

    return { ...defaultOption };
  }
}
