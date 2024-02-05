import { addOrOverride } from "@/util/array";

describe("addOrOverride", () => {
  describe("when merge elements exist in origin", () => {
    it("should override the origin elements", () => {
      const result = addOrOverride(
        [
          { id: "1", name: "a" },
          { id: "2", name: "b" },
        ],
        [{ id: "1", name: "b" }],
        (x) => x.id,
      );

      expect(result).toEqual([
        { id: "1", name: "b" },
        { id: "2", name: "b" },
      ]);
    });
  });

  describe("when merge elements doesn't exist in origin", () => {
    it("should add the elements", () => {
      const result = addOrOverride(
        [
          { id: "1", name: "a" },
          { id: "2", name: "b" },
        ],
        [
          { id: "3", name: "c" },
          { id: "4", name: "d" },
        ],
        (x) => x.id,
      );

      expect(result).toEqual([
        { id: "1", name: "a" },
        { id: "2", name: "b" },
        { id: "3", name: "c" },
        { id: "4", name: "d" },
      ]);
    });
  });
});
