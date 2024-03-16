import { LocalDirectory } from "@/fs/localDirectory";
import { Config } from "@/scenario/compile/config";
import { EnvConfig } from "@/scenario/compile/envConfig";
import { Hook } from "@/scenario/compile/hook";
import { PluginConfig } from "@/scenario/compile/pluginConfig";
import { ScenarioBook } from "@/scenario/compile/scenarioBook";
import { ScenarioGenerator } from "@/scenario/compile/scenarioGenerator";
import { MockFile } from "@/testUtil/fs/mockFile";
import { MockFileContents } from "@/testUtil/fs/mockFileContents";
import { buildNoEscapeEta } from "@/util/eta";
import path from "path";

describe("ScenarioGenerator", () => {
  describe("generate", () => {
    it("should generate file with scenarioBook", async () => {
      const etaInstance = buildNoEscapeEta(
        new LocalDirectory(path.join(__dirname, "../template")),
      );
      const config = new Config(
        0,
        new EnvConfig(new Map()),
        new PluginConfig([], [], []),
      );
      const scenarioGenerator = new ScenarioGenerator(etaInstance, config);
      const scenarioBook = new ScenarioBook([], [], new Map(), new Hook(), 0);
      const fileContents = new MockFileContents();
      const outFile = new MockFile("outFile", fileContents);

      await scenarioGenerator.generate(outFile, scenarioBook);

      expect(outFile.writtenText).toMatch(
        "// Code generated by Echoed. DO NOT EDIT.",
      );
    });
  });
});
