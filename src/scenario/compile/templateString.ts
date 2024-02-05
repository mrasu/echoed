import { TsString } from "@/scenario/compile/tsString";
import { escapeTemplateString } from "@/scenario/compile/util";

export class TemplateString extends TsString {
  constructor(public readonly value: string) {
    super();
  }

  override toTsLine(): string {
    return `\`${escapeTemplateString(this.value)}\``;
  }
}
