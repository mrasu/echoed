import { TsString } from "@/scenario/compile/common/tsString";
import { TsVariableParser } from "@/scenario/compile/common/tsVariableParser";
import { JsonSchema } from "@/type/jsonZod";
import { neverVisit } from "@/util/never";
import { transformToMap } from "@/util/record";

export type TsVariableValue =
  | Map<string, TsVariable>
  | TsVariable[]
  | TsString
  | boolean
  | number
  | null;

export class TsVariable extends TsString {
  static parse(schema: JsonSchema): TsVariable {
    return TsVariableParser.parse(schema);
  }

  static parseRecord(
    schema: Record<string, JsonSchema> | undefined,
  ): Map<string, TsVariable> {
    if (!schema) return new Map();

    return transformToMap(schema, (value) => TsVariable.parse(value));
  }

  constructor(public readonly value: TsVariableValue) {
    super();
  }

  toTsLine(): string {
    if (this.value === null) {
      return "null";
    } else if (this.value instanceof TsString) {
      return this.value.toTsLine();
    } else if (typeof this.value === "boolean") {
      return this.value.toString();
    } else if (typeof this.value === "number") {
      return this.value.toString();
    } else if (Array.isArray(this.value)) {
      const texts = [];
      for (const v of this.value) {
        texts.push(`${v.toTsLine()}`);
      }
      return `[${texts.join(",")}]`;
    } else if (this.value instanceof Map) {
      const texts = [];
      texts.push(`{`);
      for (const [key, value] of this.value.entries()) {
        texts.push(`"${key}": ${value.toTsLine()},`);
      }
      texts.push(`}`);

      return texts.join("");
    } else {
      neverVisit("unknown TsVariable", this.value);
    }
  }
}
