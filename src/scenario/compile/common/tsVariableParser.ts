import { RawString } from "@/scenario/compile/common/rawString";
import { TemplateString } from "@/scenario/compile/common/templateString";
import {
  TsVariable,
  TsVariableValue,
} from "@/scenario/compile/common/tsVariable";
import { JsonSchema } from "@/type/jsonZod";
import { neverVisit } from "@/util/never";
import { transformToMap } from "@/util/record";

const RAW_STRING_REG = /^\$\{(.+)}$/;

export class TsVariableParser {
  static parse(schema: JsonSchema): TsVariable {
    return new TsVariable(this.parseTsVariableValue(schema));
  }

  private static parseTsVariableValue(schema: JsonSchema): TsVariableValue {
    if (schema === null) {
      return null;
    } else if (typeof schema === "string") {
      const match = schema.match(RAW_STRING_REG);
      if (match) {
        return new RawString(match[1]);
      }
      return new TemplateString(schema);
    } else if (Array.isArray(schema)) {
      const vals: TsVariable[] = [];
      for (const v of schema) {
        vals.push(this.parse(v));
      }
      return vals;
    } else if (typeof schema === "object") {
      return transformToMap(schema, (v) => this.parse(v));
    } else if (typeof schema === "boolean" || typeof schema === "number") {
      return schema;
    } else {
      neverVisit("unknown TsVariable", schema);
    }
  }
}
