import { toOnlyCharacters, truncateString } from "@/util/string";

describe("truncateString", () => {
  describe("when the string is shorter than the max length", () => {
    it("should not truncate the string", () => {
      expect(truncateString("hello", 10)).toBe("hello");
    });
  });

  describe("when the string is equal to the max length", () => {
    it("should not truncate the string", () => {
      expect(truncateString("hello", 5)).toBe("hello");
    });
  });

  describe("when the string is longer than the max length", () => {
    it("should truncate the string", () => {
      expect(truncateString("hello world", 5)).toBe("hello...");
    });
  });
});

describe("toOnlyCharacters", () => {
  it("should remove non-alphanumeric characters", () => {
    expect(toOnlyCharacters("hello, world!")).toBe("helloworld");
  });
});
