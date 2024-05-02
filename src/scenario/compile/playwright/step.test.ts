import { Act } from "@/scenario/compile/common/act";
import { ActRunner } from "@/scenario/compile/common/actRunner";
import { Arrange } from "@/scenario/compile/common/arrange";
import { ArrangeRunner } from "@/scenario/compile/common/arrangeRunner";
import { Assert } from "@/scenario/compile/common/assert";
import { RawString } from "@/scenario/compile/common/rawString";
import { RunnerContainer } from "@/scenario/compile/common/runnerContainer";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { LocatorAssertionString } from "@/scenario/compile/playwright/locatorAssertionString";
import { Step } from "@/scenario/compile/playwright/step";
import { buildConfig } from "@/testUtil/scenario/util";

describe("Step", () => {
  describe("parse", () => {
    const config = buildConfig();

    describe("when schema is minimal", () => {
      it("should return Step", () => {
        const step = Step.parse(config, {});

        expect(step).toStrictEqual(
          new Step(undefined, new Map(), [], undefined, [], new Map()),
        );
      });
    });

    describe("when description is defined", () => {
      it("should set description", () => {
        const step = Step.parse(config, {
          description: "my step",
        });

        expect(step).toStrictEqual(
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

        expect(step).toStrictEqual(
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
            {
              expectToBeAttached: "foo",
            },
          ],
        });

        expect(step).toStrictEqual(
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
              new Arrange(
                new LocatorAssertionString("toBeAttached", "foo", [], false),
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

        expect(step).toStrictEqual(
          new Step(
            undefined,
            new Map(),
            [],
            new Act(
              new ActRunner(
                new RunnerContainer(
                  "dummyRunner",
                  undefined,
                  new RunnerOption(new Map()),
                ),
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
          assert: [
            "my assert",
            {
              expectToBeAttached: "foo",
            },
          ],
        });

        expect(step).toStrictEqual(
          new Step(
            undefined,
            new Map(),
            [],
            undefined,
            [
              new Assert(new RawString("my assert"), undefined),
              new Assert(
                new LocatorAssertionString("toBeAttached", "foo", [], false),
              ),
            ],
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

        expect(step).toStrictEqual(
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
});
