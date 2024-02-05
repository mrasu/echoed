import { RawString } from "@/scenario/compile/rawString";

describe("RawString", () => {
  describe("toTsLine", () => {
    it("should return value as-is", () => {
      const value = "foo-`bar`";
      const rawString = new RawString(value);

      expect(rawString.toTsLine()).toBe(value);
    });
  });
});
