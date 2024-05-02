import { IDirectory } from "@/fs/iDirectory";

export class ScenarioCompileTargetConfig {
  constructor(
    public readonly yamlDir: IDirectory,
    public readonly outDir: IDirectory,
    public readonly type: "jest" | "playwright",
    public readonly useEchoedFeatures: boolean,
  ) {}
}
