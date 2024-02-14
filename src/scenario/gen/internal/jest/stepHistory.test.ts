import { StepHistory } from "@/scenario/gen/internal/jest/stepHistory";

describe("StepHistory", () => {
  describe("currentStepIndex", () => {
    describe("when step is not added", () => {
      it("should return -1", () => {
        const history = new StepHistory();
        expect(history.currentStepIndex).toBe(-1);
      });
    });

    describe("when step is the first", () => {
      it("should return zero", () => {
        const history = new StepHistory();
        history.next();

        expect(history.currentStepIndex).toBe(0);
      });
    });

    describe("when step is not the first", () => {
      it("should return index", () => {
        const history = new StepHistory();
        history.next();
        history.next();
        history.next();

        expect(history.currentStepIndex).toBe(2);
      });
    });
  });

  describe("actResult", () => {
    let history: StepHistory;
    beforeEach(() => {
      history = new StepHistory();
      history.next();
    });

    describe("when no result is set", () => {
      it("should return undefined", () => {
        expect(history.actResult).toBe(undefined);
      });
    });

    describe("when result is set", () => {
      it("should return the result", () => {
        history.setActResult("result");

        expect(history.actResult).toBe("result");
      });
    });

    describe("when complex result is set", () => {
      it("should return the result", () => {
        const result = { a: { b: { c: "result" } } };
        history.setActResult(result);

        expect(history.actResult).toEqual(result);
      });
    });
  });

  describe("next", () => {
    let history: StepHistory;
    beforeEach(() => {
      history = new StepHistory();
      history.next();
      history.setActResult("result");
    });

    it("should return ActResultHistory that can be accessed with negative index", () => {
      const actResultHistory = history.next();

      expect(actResultHistory).toEqual(["result", undefined]);
      expect(actResultHistory[-1]).toBe("result");
    });
  });

  describe("setActResult", () => {
    let history: StepHistory;
    beforeEach(() => {
      history = new StepHistory();
      history.next();
      history.setActResult("result0");
      history.next();
    });

    it("should return result and history", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [actResult, actResultHistory] = history.setActResult("result1");

      expect(actResult).toBe("result1");
      expect(actResultHistory).toEqual(["result0", "result1"]);
      expect(actResultHistory[-1]).toBe("result0");
    });
  });
});
