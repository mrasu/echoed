import { LocalFile } from "@/fs/localFile";
import { Act } from "@/scenario/compile/common/act";
import { Arrange } from "@/scenario/compile/common/arrange";
import { Assert } from "@/scenario/compile/common/assert";
import { RawString } from "@/scenario/compile/common/rawString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { Fixtures } from "@/scenario/compile/playwright/fixtures";
import { Hook } from "@/scenario/compile/playwright/hook";
import { LocatorAssertionString } from "@/scenario/compile/playwright/locatorAssertionString";
import { Scenario } from "@/scenario/compile/playwright/scenario";
import { ScenarioBook } from "@/scenario/compile/playwright/scenarioBook";
import { ScenarioBookParser } from "@/scenario/compile/playwright/scenarioBookParser";
import { Step } from "@/scenario/compile/playwright/step";
import { UseOption } from "@/scenario/compile/playwright/useOption";
import {
  buildAsserterConfig,
  buildConfig,
  buildRunnerConfig,
} from "@/testUtil/scenario/util";
import yaml from "js-yaml";
import path from "path";

describe("ScenarioBookParser", () => {
  describe("parse", () => {
    it("should return ScenarioBook", async () => {
      const config = buildConfig({
        runners: [buildRunnerConfig({ name: "fetch" })],
        asserters: [buildAsserterConfig({ name: "assertStatus" })],
      });
      const parser = new ScenarioBookParser(config);
      const yamlText = await new LocalFile(
        path.join(__dirname, "testdata/scenario.yml"),
      ).read();

      const scenarioBook = parser.parse(yaml.load(yamlText.toString()));

      expect(scenarioBook).toStrictEqual(
        new ScenarioBook(
          [
            new Scenario(
              "Simple test should pass",
              new Fixtures(["page"]),
              new Map([["session", TsVariable.parse("${defaultSession()}")]]),
              false,
              [
                new Step(
                  "Get cart",
                  new Map(),
                  [
                    new Arrange(
                      new LocatorAssertionString(
                        "toBeVisible",
                        "[data-cy=home-page]",
                        [],
                        false,
                      ),
                    ),
                    new Arrange(
                      new RawString(
                        `await page.locator("[data-cy=cart-link]").click()`,
                      ),
                    ),
                  ],
                  new Act(
                    undefined,
                    new RawString(
                      `await page.locator("[data-cy=currency-switcher]").selectOption("EUR")`,
                    ),
                  ),
                  [
                    new Assert(
                      new LocatorAssertionString(
                        "toBeVisible",
                        "[data-cy=product-detail]",
                        [],
                        false,
                      ),
                    ),
                    new Assert(
                      new RawString("expect(_.jsonBody.items.length).toBe(0)"),
                    ),
                  ],
                  new Map(),
                ),
              ],
            ),
          ],
          new UseOption(new Map()),
          [],
          new Map(),
          new Hook(),
          undefined,
        ),
      );
    });

    describe("when yaml is invalid", () => {
      it("should throw InvalidScenarioError", async () => {
        const config = buildConfig({});
        const parser = new ScenarioBookParser(config);

        const yamlText = await new LocalFile(
          path.join(__dirname, "testdata/invalidScenario.yml"),
        ).read();
        const result = parser.parse(yaml.load(yamlText));
        expect(result).toMatchObject({ success: false });
      });
    });
  });
});
