import { RawString } from "@/scenario/compile/common/rawString";
import { TsString } from "@/scenario/compile/common/tsString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { z } from "zod";

export const UseOptionSchema = z.record(
  z.string().or(z.strictObject({ raw: z.string() })),
);
export type UseOptionSchema = z.infer<typeof UseOptionSchema>;

export class UseOption {
  static parse(schema: UseOptionSchema): UseOption {
    const options = new Map<string, TsString>();

    for (const [key, value] of Object.entries(schema)) {
      if (typeof value === "string") {
        options.set(key, TsVariable.parse(value));
      } else {
        options.set(key, new RawString(value.raw));
      }
    }

    return new UseOption(options);
  }

  constructor(public readonly options: Map<string, TsString>) {}

  size(): number {
    return this.options.size;
  }
}
