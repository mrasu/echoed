import { TemplateString } from "@/scenario/compile/common/templateString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { Fixtures } from "@/scenario/compile/playwright/fixtures";
import { Scenario } from "@/scenario/compile/playwright/scenario";
import { Step } from "@/scenario/compile/playwright/step";
import { buildConfig } from "@/testUtil/scenario/util";

describe("Scenario", () => {
  describe("parse", () => {
    const config = buildConfig();

    describe("when scenario is minimal", () => {
      it("should return Scenario", () => {
        const scenario = Scenario.parse(config, {
          name: "my scenario",
          steps: [],
        });

        expect(scenario).toStrictEqual(
          new Scenario("my scenario", new Fixtures([]), new Map(), false, []),
        );
      });
    });

    describe("when fixtures is defined", () => {
      it("should set fixtures", () => {
        const scenario = Scenario.parse(config, {
          name: "my scenario",
          fixtures: ["foo", "bar"],
          steps: [],
        });

        expect(scenario).toStrictEqual(
          new Scenario(
            "my scenario",
            new Fixtures(["foo", "bar"]),
            new Map(),
            false,
            [],
          ),
        );
      });
    });

    describe("when skip is defined", () => {
      it("should set skip", () => {
        const scenario = Scenario.parse(config, {
          name: "my scenario",
          skip: true,
          steps: [],
        });

        expect(scenario).toStrictEqual(
          new Scenario("my scenario", new Fixtures([]), new Map(), true, []),
        );
      });
    });

    describe("when variable is defined", () => {
      it("should set variable", () => {
        const scenario = Scenario.parse(config, {
          name: "my scenario",
          variable: {
            foo: "bar",
            buz: { a: 1 },
          },
          steps: [],
        });

        expect(scenario).toStrictEqual(
          new Scenario(
            "my scenario",
            new Fixtures([]),
            new Map([
              ["foo", new TsVariable(new TemplateString("bar"))],
              ["buz", new TsVariable(new Map([["a", new TsVariable(1)]]))],
            ]),
            false,
            [],
          ),
        );
      });
    });

    describe("when steps is defined", () => {
      it("should set steps", () => {
        const scenario = Scenario.parse(config, {
          name: "my scenario",
          steps: [
            {
              description: "my step",
            },
          ],
        });

        expect(scenario).toStrictEqual(
          new Scenario("my scenario", new Fixtures([]), new Map(), false, [
            new Step("my step", new Map(), [], undefined, [], new Map()),
          ]),
        );
      });
    });
  });
});
