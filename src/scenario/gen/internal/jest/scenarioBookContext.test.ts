import { HookContext } from "@/scenario/gen/internal/jest/hookContext";
import { ScenarioBookContext } from "@/scenario/gen/internal/jest/scenarioBookContext";
import { buildScenarioBookContext } from "@/testUtil/scenario/gen/internal/jest/scenarioBookContext";

describe("ScenarioBookContext", () => {
  describe("runHook", () => {
    describe("when beforeAll", () => {
      it("should run hook with only beforeAll variables", async () => {
        const ctx = buildScenarioBookContext({
          hookBoundVariables: {
            beforeAll: { beforeAllOpt: "beforeAllVal" },
            afterAll: { afterAllOpt: "afterAllVal" },
            beforeEach: { beforeEachOpt: "beforeEachVal" },
            afterEach: { afterEachOpt: "afterEachVal" },
          },
        });

        let hookCtxArg: HookContext | undefined;
        const fn = async (hookContext: HookContext): Promise<void> => {
          hookCtxArg = hookContext;
          return Promise.resolve();
        };
        await ctx.runHook("beforeAll", fn);

        expect(hookCtxArg?.boundVariables).toEqual({
          beforeAllOpt: "beforeAllVal",
        });
      });
    });

    describe("when afterAll", () => {
      it("should run hook with all boundVariables", async () => {
        const ctx = buildScenarioBookContext({
          hookBoundVariables: {
            beforeAll: { beforeAllOpt: "beforeAllVal" },
            afterAll: { afterAllOpt: "afterAllVal" },
            beforeEach: { beforeEachOpt: "beforeEachVal" },
            afterEach: { afterEachOpt: "afterEachVal" },
          },
        });

        let hookCtxArg: HookContext | undefined;
        const fn = async (hookContext: HookContext): Promise<void> => {
          hookCtxArg = hookContext;
          return Promise.resolve();
        };
        await ctx.runHook("afterAll", fn);

        expect(hookCtxArg?.boundVariables).toEqual({
          beforeAllOpt: "beforeAllVal",
          afterAllOpt: "afterAllVal",
          beforeEachOpt: "beforeEachVal",
          afterEachOpt: "afterEachVal",
        });
      });
    });

    describe("when beforeEach", () => {
      it("should run hook with beforeAll and beforeEach", async () => {
        const ctx = buildScenarioBookContext({
          hookBoundVariables: {
            beforeAll: { beforeAllOpt: "beforeAllVal" },
            afterAll: { afterAllOpt: "afterAllVal" },
            beforeEach: { beforeEachOpt: "beforeEachVal" },
            afterEach: { afterEachOpt: "afterEachVal" },
          },
        });

        let hookCtxArg: HookContext | undefined;
        const fn = async (hookContext: HookContext): Promise<void> => {
          hookCtxArg = hookContext;
          return Promise.resolve();
        };
        await ctx.runHook("beforeEach", fn);

        expect(hookCtxArg?.boundVariables).toEqual({
          beforeAllOpt: "beforeAllVal",
          beforeEachOpt: "beforeEachVal",
        });
      });
    });

    describe("when afterEach", () => {
      it("should run hook with beforeAll, beforeEach and afterEach", async () => {
        const ctx = buildScenarioBookContext({
          hookBoundVariables: {
            beforeAll: { beforeAllOpt: "beforeAllVal" },
            afterAll: { afterAllOpt: "afterAllVal" },
            beforeEach: { beforeEachOpt: "beforeEachVal" },
            afterEach: { afterEachOpt: "afterEachVal" },
          },
        });

        let hookCtxArg: HookContext | undefined;
        const fn = async (hookContext: HookContext): Promise<void> => {
          hookCtxArg = hookContext;
          return Promise.resolve();
        };
        await ctx.runHook("afterEach", fn);

        expect(hookCtxArg?.boundVariables).toEqual({
          beforeAllOpt: "beforeAllVal",
          beforeEachOpt: "beforeEachVal",
          afterEachOpt: "afterEachVal",
        });
      });
    });

    describe("when bind inside hook", () => {
      it("should bring hook's result", async () => {
        const ctx = buildScenarioBookContext();

        let hookCtxArg: HookContext | undefined;
        await ctx.runHook("beforeAll", async (hookCtx) => {
          hookCtxArg = hookCtx;
          hookCtx.bindNewVariable("foo", "bar");
          return Promise.resolve();
        });
        expect(hookCtxArg?.boundVariables).toEqual({});

        await ctx.runHook("beforeAll", async (hookCtx) => {
          hookCtxArg = hookCtx;
          return Promise.resolve();
        });
        expect(hookCtxArg?.boundVariables).toEqual({
          foo: "bar",
        });
      });
    });
  });

  describe("clearHookBoundVariablesFor", () => {
    it("should clear boundVariables", () => {
      const ctx = buildScenarioBookContext({
        hookBoundVariables: {
          beforeAll: { beforeAllOpt: "beforeAllVal" },
          afterAll: { afterAllOpt: "afterAllVal" },
        },
      });

      ctx.clearHookBoundVariablesFor("beforeAll");

      expect(ctx.hookBoundVariables).toEqual({
        beforeAll: {},
        afterAll: { afterAllOpt: "afterAllVal" },
        beforeEach: {},
        afterEach: {},
      });
    });
  });

  describe("getHookBoundVariablesForStep", () => {
    it("should return variables for beforeAll and beforeEach", () => {
      const ctx = buildScenarioBookContext({
        hookBoundVariables: {
          beforeAll: { beforeAllOpt: "beforeAllVal" },
          afterAll: { afterAllOpt: "afterAllVal" },
          beforeEach: { beforeEachOpt: "beforeEachVal" },
          afterEach: { afterEachOpt: "afterEachVal" },
        },
      });

      const variables = ctx.getHookBoundVariablesForStep();

      expect(variables).toEqual({
        beforeAllOpt: "beforeAllVal",
        beforeEachOpt: "beforeEachVal",
      });
    });
  });

  describe("newScenarioContext", () => {
    it("should return ScenarioContext", () => {
      const ctx = buildScenarioBookContext();
      const scenarioContext = ctx.newScenarioContext("dummyName");

      expect(scenarioContext.scenarioName).toEqual("dummyName");
    });
  });

  describe("setDefaultRunnerOption", () => {
    it("should set default for buildRunnerOption", () => {
      const ctx = new ScenarioBookContext();
      ctx.setDefaultRunnerOption({
        fetch: {
          foo: "bar",
          baz: "qux",
        },
      });

      expect(ctx.buildRunnerOption("fetch", {})).toEqual({
        foo: "bar",
        baz: "qux",
      });
    });
  });

  describe("overrideDefaultRunnerOption", () => {
    it("should override default for buildRunnerOption", () => {
      const ctx = new ScenarioBookContext();
      ctx.setDefaultRunnerOption({
        fetch: {
          foo: "bar",
          baz: "qux",
        },
      });
      ctx.overrideDefaultRunnerOption("fetch", { hello: "world" });

      expect(ctx.buildRunnerOption("fetch", {})).toEqual({
        hello: "world",
      });
    });
  });

  describe("buildRunnerOption", () => {
    it("should return option merging with default", () => {
      const ctx = new ScenarioBookContext();
      ctx.setDefaultRunnerOption({
        fetch: {
          foo: "bar",
          baz: "qux",
        },
      });
      const opt = ctx.buildRunnerOption("fetch", {
        foo: "bar-bar",
        hello: "world",
      });

      expect(opt).toEqual({
        foo: "bar-bar",
        baz: "qux",
        hello: "world",
      });
    });
  });

  describe("setDefaultAsserterOption", () => {
    it("should set default for buildAsserterOption", () => {
      const ctx = new ScenarioBookContext();
      ctx.setDefaultAsserterOption({
        fetch: {
          foo: "bar",
          baz: "qux",
        },
      });

      expect(ctx.buildAsserterOption("fetch")).toEqual({
        foo: "bar",
        baz: "qux",
      });
    });
  });
});
