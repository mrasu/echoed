import { Eq } from "@/comparision/eq";
import { Reg } from "@/comparision/reg";
import {
  convertToComparable,
  convertToComparables,
} from "@/config/util/mapper";

describe("convertToComparables", () => {
  describe("when argument is undefined", () => {
    it("should return empty Map", () => {
      expect(convertToComparables(undefined)).toEqual(new Map());
    });
  });

  describe("when argument is empty object", () => {
    it("should return empty Map", () => {
      expect(convertToComparables({})).toEqual(new Map());
    });
  });

  describe("when argument is not empty", () => {
    it("should return Map", () => {
      expect(
        convertToComparables({
          hello: "world",
          foo: 123,
        }),
      ).toEqual(
        new Map([
          ["hello", new Eq("world")],
          ["foo", new Eq(123)],
        ]),
      );
    });
  });
});

describe("convertToComparable", () => {
  describe("when argument is string", () => {
    it("should return Eq", () => {
      expect(convertToComparable("hello")).toEqual(new Eq("hello"));
    });
  });

  describe("when argument is boolean", () => {
    it("should return Eq", () => {
      expect(convertToComparable(true)).toEqual(new Eq(true));
    });
  });

  describe("when argument is number", () => {
    it("should return Eq", () => {
      expect(convertToComparable(123)).toEqual(new Eq(123));
    });
  });

  describe("when argument is regexp value", () => {
    it("should return Reg", () => {
      expect(convertToComparable({ regexp: "^/a/.+$" })).toEqual(
        new Reg(/^\/a\/.+$/),
      );
    });
  });
});
