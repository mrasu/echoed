import { TsString } from "@/scenario/compile/common/tsString";
import { escapeTemplateString } from "@/scenario/compile/common/util";

export class TemplateString extends TsString {
  constructor(public readonly value: string) {
    super();
  }

  override toTsLine(): string {
    return `\`${escapeTemplateString(this.value)}\``;
  }
}
