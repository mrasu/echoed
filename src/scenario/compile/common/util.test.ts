import { escapeTemplateString } from "@/scenario/compile/common/util";

describe("escapeTemplateString", () => {
  describe("when str contains back quote", () => {
    it("should return str with back slash", () => {
      expect(escapeTemplateString("foo`bar")).toEqual("foo\\`bar");
    });
  });

  describe("when str doesn't contain back quote", () => {
    it("should return str as-is", () => {
      expect(escapeTemplateString("foo")).toEqual("foo");
    });
  });
});
