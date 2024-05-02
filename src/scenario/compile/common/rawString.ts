import { TsString } from "@/scenario/compile/common/tsString";

export class RawString extends TsString {
  constructor(public readonly value: string) {
    super();
  }

  override toTsLine(): string {
    return this.value;
  }
}
