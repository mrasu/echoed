import { Act } from "@/scenario/compile/act";
import { Assert } from "@/scenario/compile/assert";
import { RawString } from "@/scenario/compile/rawString";
import { RunnerOption } from "@/scenario/compile/runnerOption";
import { Step } from "@/scenario/compile/step";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { buildConfig, buildStep } from "@/testUtil/scenario/util";

describe("Step", () => {
  describe("parse", () => {
    const config = buildConfig();

    describe("when schema is minimal", () => {
      it("should return Step", () => {
        const step = Step.parse(config, {});

        expect(step).toEqual(
          new Step(undefined, new Map(), undefined, [], new Map()),
        );
      });
    });

    describe("when description is defined", () => {
      it("should set description", () => {
        const step = Step.parse(config, {
          description: "my step",
        });

        expect(step).toEqual(
          new Step("my step", new Map(), undefined, [], new Map()),
        );
      });
    });

    describe("when variable is defined", () => {
      it("should set variable", () => {
        const step = Step.parse(config, {
          variable: {
            foo: "bar",
          },
        });

        expect(step).toEqual(
          new Step(
            undefined,
            new Map([["foo", TsVariable.parse("bar")]]),
            undefined,
            [],
            new Map(),
          ),
        );
      });
    });

    describe("when act is defined", () => {
      it("should set act", () => {
        const step = Step.parse(config, {
          act: {
            runner: "dummyRunner",
          },
        });

        expect(step).toEqual(
          new Step(
            undefined,
            new Map(),
            new Act("dummyRunner", undefined, new RunnerOption(new Map())),
            [],
            new Map(),
          ),
        );
      });
    });

    describe("when asserts is defined", () => {
      it("should set asserts", () => {
        const step = Step.parse(config, {
          assert: ["my assert"],
        });

        expect(step).toEqual(
          new Step(
            undefined,
            new Map(),
            undefined,
            [new Assert(new RawString("my assert"), undefined)],
            new Map(),
          ),
        );
      });
    });

    describe("when bind is defined", () => {
      it("should set bind", () => {
        const step = Step.parse(config, {
          bind: {
            foo: "bar",
          },
        });

        expect(step).toEqual(
          new Step(
            undefined,
            new Map(),
            undefined,
            [],
            new Map([["foo", TsVariable.parse("bar")]]),
          ),
        );
      });
    });
  });

  describe("boundVariables", () => {
    it("should return bound variables", () => {
      const step = buildStep({
        bind: new Map([
          ["foo", TsVariable.parse("bar")],
          ["buz", TsVariable.parse(1)],
        ]),
      });

      expect([...step.boundVariables()]).toEqual(["foo", "buz"]);
    });
  });
});
