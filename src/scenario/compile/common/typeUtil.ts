import { ScenarioBase } from "@/scenario/compile/common/scenarioBase";
import { ScenarioBookBase } from "@/scenario/compile/common/scenarioBookBase";

// TODO: create function to extract generics type from ScenarioBaseType or ScenarioBookBaseType
export type ScenarioBaseType<Type> = Type extends ScenarioBase<infer X>
  ? X
  : never;

export type ScenarioBookBaseType<Type> = Type extends ScenarioBookBase<infer X>
  ? X
  : never;
