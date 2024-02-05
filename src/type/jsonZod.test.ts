import { JsonSchema } from "@/type/jsonZod";

describe("JsonSchema", () => {
  describe("when value is literal", () => {
    it("should return value", () => {
      const actual = JsonSchema.parse(1);
      expect(actual).toEqual(1);
    });
  });

  describe("when value is array", () => {
    it("should return value", () => {
      const actual = JsonSchema.parse([1, 2, 3]);
      expect(actual).toEqual([1, 2, 3]);
    });
  });

  describe("when value is object", () => {
    it("should return value", () => {
      const actual = JsonSchema.parse({ a: 1, b: 2, c: 3 });
      expect(actual).toEqual({ a: 1, b: 2, c: 3 });
    });
  });
});
