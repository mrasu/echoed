import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { JsonSchema } from "@/type/jsonZod";
import { transformToMap } from "@/util/record";

export class RunnerOption {
  static parse(record: Record<string, JsonSchema> | undefined): RunnerOption {
    const option = transformToMap(record, (v) => TsVariable.parse(v));

    return new RunnerOption(option);
  }

  constructor(private readonly option: Map<string, TsVariable>) {}

  entries(): IterableIterator<[string, TsVariable]> {
    return this.option.entries();
  }
}
