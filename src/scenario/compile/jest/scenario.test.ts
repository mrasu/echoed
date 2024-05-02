import { TemplateString } from "@/scenario/compile/common/templateString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { Scenario } from "@/scenario/compile/jest/scenario";
import { Step } from "@/scenario/compile/jest/step";
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

        expect(scenario).toEqual({
          name: "my scenario",
          skip: false,
          variable: new Map(),
          steps: [],
        });
      });
    });

    describe("when skip is defined", () => {
      it("should set skip", () => {
        const scenario = Scenario.parse(config, {
          name: "my scenario",
          skip: true,
          steps: [],
        });

        expect(scenario).toEqual({
          name: "my scenario",
          skip: true,
          variable: new Map(),
          steps: [],
        });
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

        expect(scenario).toEqual({
          name: "my scenario",
          skip: false,
          variable: new Map([
            ["foo", new TsVariable(new TemplateString("bar"))],
            ["buz", new TsVariable(new Map([["a", new TsVariable(1)]]))],
          ]),
          steps: [],
        });
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

        expect(scenario).toEqual({
          name: "my scenario",
          skip: false,
          variable: new Map(),
          steps: [new Step("my step", new Map(), [], undefined, [], new Map())],
        });
      });
    });
  });
});
