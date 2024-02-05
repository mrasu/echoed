import { TemplateString } from "@/scenario/compile/templateString";

describe("TemplateString", () => {
  describe("toTsLine", () => {
    it("should return template string", () => {
      const templateString = new TemplateString("foo`bar");

      expect(templateString.toTsLine()).toEqual("`foo\\`bar`");
    });
  });
});
