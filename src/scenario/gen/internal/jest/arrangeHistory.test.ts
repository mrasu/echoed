import { ArrangeHistory } from "@/scenario/gen/internal/jest/arrangeHistory";

describe("ArrangeHistory", () => {
  describe("currentArrangeIndex", () => {
    describe("when first", () => {
      it("should return 0", () => {
        const arrangeHistory = new ArrangeHistory();
        arrangeHistory.next();

        const index = arrangeHistory.currentArrangeIndex;
        expect(index).toBe(0);
      });
    });

    describe("when not first", () => {
      it("should return index", () => {
        const arrangeHistory = new ArrangeHistory();
        arrangeHistory.next();
        arrangeHistory.next();

        const index = arrangeHistory.currentArrangeIndex;
        expect(index).toBe(1);
      });
    });
  });

  describe("restart", () => {
    it("should return empty arrangeHistory", () => {
      const arrangeHistory = new ArrangeHistory();
      const ret = arrangeHistory.restart();

      expect(ret).toEqual([]);
    });
  });

  describe("next", () => {
    it("should return pushed arrangeHistory", () => {
      const arrangeHistory = new ArrangeHistory();
      arrangeHistory.next();
      const ret = arrangeHistory.next();

      expect(ret).toEqual([undefined, undefined]);
    });
  });

  describe("setResult", () => {
    it("should return pushed arrangeHistory", () => {
      const arrangeHistory = new ArrangeHistory();
      arrangeHistory.next();
      arrangeHistory.next();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [ret, history] = arrangeHistory.setResult(123);

      expect(ret).toEqual(123);
      expect(history).toEqual([undefined, 123]);
    });
  });
});
