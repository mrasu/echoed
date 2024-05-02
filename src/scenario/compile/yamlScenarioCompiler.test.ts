import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { ScenarioCompileTargetConfig } from "@/config/scenarioCompileTargetConfig";
import { LocalDirectory } from "@/fs/localDirectory";
import { YamlScenarioCompiler } from "@/scenario/compile/yamlScenarioCompiler";
import { MockDirectory } from "@/testUtil/fs/mockDirectory";
import { MockFileContents } from "@/testUtil/fs/mockFileContents";
import path from "path";

describe("YamlScenarioCompiler", () => {
  describe("compileAll", () => {
    it("should create tests in the same structure of yaml directory", async () => {
      const fileContents = new MockFileContents();
      const echoedRootDir = new LocalDirectory(path.join(__dirname, "../../"));
      const compileConfig = new ScenarioCompileConfig(
        [
          new ScenarioCompileTargetConfig(
            new LocalDirectory(path.join(__dirname, "jest/testdata/scenario")),
            new MockDirectory("out", fileContents),
            "jest",
            true,
          ),
        ],
        true,
        0,
        {},
        {
          runners: [],
          asserters: [],
          commons: [],
        },
      );
      const compiler = new YamlScenarioCompiler(echoedRootDir, compileConfig);
      const cwd = new MockDirectory("", fileContents);
      await compiler.compileAll(cwd);

      const simpleTest = fileContents.get("out/simple.test.ts");
      expect(simpleTest).toMatch("/simple");
      expect(simpleTest).toMatch('expect(_).toBe("in simple")');

      const nestTest = fileContents.get("out/nest1/nest2/in_nest.test.ts");
      expect(nestTest).toMatch("/in_nest");
      expect(nestTest).toMatch('expect(_).toBe("in nest")');
    });
  });
});
