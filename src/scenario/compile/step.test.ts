import { Act } from "@/scenario/compile/act";
import { Arrange } from "@/scenario/compile/arrange";
import { ArrangeRunner } from "@/scenario/compile/arrangeRunner";
import { Assert } from "@/scenario/compile/assert";
import { RawString } from "@/scenario/compile/rawString";
import { RunnerContainer } from "@/scenario/compile/runnerContainer";
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
          new Step(undefined, new Map(), [], undefined, [], new Map()),
        );
      });
    });

    describe("when description is defined", () => {
      it("should set description", () => {
        const step = Step.parse(config, {
          description: "my step",
        });

        expect(step).toEqual(
          new Step("my step", new Map(), [], undefined, [], new Map()),
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
            [],
            undefined,
            [],
            new Map(),
          ),
        );
      });
    });

    describe("when arrange is defined", () => {
      it("should set arranges", () => {
        const step = Step.parse(config, {
          arrange: [
            "foo()",
            {
              runner: "dummyRunner",
              bind: {
                foo: "bar",
              },
            },
            {
              bind: {
                foo: "bar",
              },
            },
          ],
        });

        expect(step).toEqual(
          new Step(
            undefined,
            new Map(),
            [
              new Arrange(new RawString("foo()")),
              new Arrange(
                undefined,
                new ArrangeRunner(
                  new RunnerContainer(
                    "dummyRunner",
                    undefined,
                    new RunnerOption(new Map()),
                  ),
                  new Map([["foo", TsVariable.parse("bar")]]),
                ),
                undefined,
              ),
              new Arrange(
                undefined,
                undefined,
                new Map([["foo", TsVariable.parse("bar")]]),
              ),
            ],
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
            [],
            new Act(
              new RunnerContainer(
                "dummyRunner",
                undefined,
                new RunnerOption(new Map()),
              ),
            ),
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
            [],
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
            [],
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

  describe("getArrangeBoundVariablesBefore", () => {
    const step = buildStep({
      arranges: [
        new Arrange(new RawString("foo()")),
        new Arrange(
          undefined,
          new ArrangeRunner(
            new RunnerContainer(
              "dummyRunner",
              undefined,
              new RunnerOption(new Map()),
            ),
            new Map([["foo", TsVariable.parse("bar")]]),
          ),
          undefined,
        ),
        new Arrange(
          undefined,
          undefined,
          new Map([["buz", TsVariable.parse(123)]]),
        ),
      ],
    });

    describe("when index is 0", () => {
      it("should return empty", () => {
        expect([...step.getArrangeBoundVariablesBefore(0)]).toEqual([]);
      });
    });

    describe("when index is greater than 0", () => {
      it("should return bound variables by arrange", () => {
        expect(step.getArrangeBoundVariablesBefore(2)).toEqual(["foo"]);
      });
    });
  });

  describe("getArrangeBoundVariables", () => {
    const step = buildStep({
      arranges: [
        new Arrange(new RawString("foo()")),
        new Arrange(
          undefined,
          new ArrangeRunner(
            new RunnerContainer(
              "dummyRunner",
              undefined,
              new RunnerOption(new Map()),
            ),
            new Map([["foo", TsVariable.parse("bar")]]),
          ),
          undefined,
        ),
        new Arrange(
          undefined,
          undefined,
          new Map([["buz", TsVariable.parse(123)]]),
        ),
      ],
    });

    it("should return all variables", () => {
      expect(step.getArrangeBoundVariables().sort()).toEqual(["buz", "foo"]);
    });
  });
});
