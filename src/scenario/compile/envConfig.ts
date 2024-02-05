import { transformToMap } from "@/util/record";

export class EnvConfig {
  static parse(schema: Record<string, string | null>): EnvConfig {
    const envMap = transformToMap(schema, (value) => value);

    return new EnvConfig(envMap);
  }

  constructor(public readonly map: Map<string, string | null>) {}
}
