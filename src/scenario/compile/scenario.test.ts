import { Scenario } from "@/scenario/compile/scenario";
import { Step } from "@/scenario/compile/step";
import { TemplateString } from "@/scenario/compile/templateString";
import { TsVariable } from "@/scenario/compile/tsVariable";
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
          steps: [new Step("my step", new Map(), undefined, [], new Map())],
        });
      });
    });
  });

  describe("getBoundVariablesBefore", () => {
    const scenario = new Scenario("scenario", new Map(), false, [
      new Step(
        "step1",
        new Map(),
        undefined,
        [],
        new Map([
          ["foo", TsVariable.parse("foo")],
          ["bar", TsVariable.parse("bar")],
        ]),
      ),
      new Step(
        "step2",
        new Map(),
        undefined,
        [],
        new Map([["buz", TsVariable.parse("buz")]]),
      ),
    ]);

    describe("when index is 0", () => {
      it("should return empty", () => {
        const variables = scenario.getBoundVariablesBefore(0);
        expect(variables).toEqual([]);
      });
    });

    describe("when index is 1", () => {
      it("should return variables of step1", () => {
        const variables = scenario.getBoundVariablesBefore(1);
        expect(variables).toEqual(["foo", "bar"]);
      });
    });
  });

  describe("escapedName", () => {
    it("should return escaped name", () => {
      const scenario = new Scenario("my `best` scenario", new Map(), false, []);
      expect(scenario.escapedName).toEqual("my \\`best\\` scenario");
    });
  });
});
