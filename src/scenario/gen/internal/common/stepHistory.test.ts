import { StepHistory } from "@/scenario/gen/internal/common/stepHistory";

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

  describe("next", () => {
    let history: StepHistory;
    beforeEach(() => {
      history = new StepHistory();
      history.next();
      history.setActResult("result");
    });

    it("should return ActResultHistory that can be accessed with negative index", () => {
      history.next();

      expect(history.actResultHistory).toEqual(["result", undefined]);
      expect(history.actResultHistory[-1]).toBe("result");
    });
  });

  describe("actResultHistory", () => {
    let history: StepHistory;
    beforeEach(() => {
      history = new StepHistory();
      history.next();
      history.setActResult("result0");
      history.next();
    });

    it("should return ActResultHistory", () => {
      expect(history.actResultHistory).toEqual(["result0", undefined]);
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

    it("should modify history", () => {
      history.setActResult("result1");

      expect(history.actResultHistory).toEqual(["result0", "result1"]);
      expect(history.actResultHistory[-1]).toBe("result0");
    });
  });
});
