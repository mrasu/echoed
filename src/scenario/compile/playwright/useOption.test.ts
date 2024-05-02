import { RawString } from "@/scenario/compile/common/rawString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { UseOption } from "@/scenario/compile/playwright/useOption";

describe("UseOption", () => {
  describe("parse", () => {
    describe("when value is string", () => {
      it("should parse", () => {
        const useOption = UseOption.parse({
          foo: "bar",
        });

        expect(useOption).toStrictEqual(
          new UseOption(new Map([["foo", TsVariable.parse("bar")]])),
        );
      });
    });

    describe("when value is raw", () => {
      it("should parse", () => {
        const useOption = UseOption.parse({
          foo: { raw: "bar" },
        });

        expect(useOption).toStrictEqual(
          new UseOption(new Map([["foo", new RawString("bar")]])),
        );
      });
    });
  });

  describe("size", () => {
    it("should return size", () => {
      const useOption = new UseOption(
        new Map([
          ["foo", TsVariable.parse("foo")],
          ["bar", TsVariable.parse("bar")],
        ]),
      );
      expect(useOption.size()).toBe(2);
    });
  });
});
