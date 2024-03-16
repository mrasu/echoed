import { Comparable } from "@/comparision/comparable";
import { Eq } from "@/comparision/eq";
import { Gt } from "@/comparision/gt";
import { Gte } from "@/comparision/gte";
import { Lt } from "@/comparision/lt";
import { Lte } from "@/comparision/lte";
import { Reg } from "@/comparision/reg";
import { JsonComparable, restoreComparables } from "@/comparision/restore";
import { z } from "zod";

describe("restoreComparables", () => {
  const toJsonComparables = (
    vals: Record<string, Comparable>,
  ): Record<string, JsonComparable> => {
    const variables = z.record(z.string(), JsonComparable);

    return variables.parse(JSON.parse(JSON.stringify(vals)));
  };

  describe("when obj is for eq", () => {
    describe("when value is string", () => {
      const obj = toJsonComparables({
        key: new Eq("abc"),
      });

      it("should return Eq instance", () => {
        expect(restoreComparables(obj)).toStrictEqual({
          key: new Eq("abc"),
        });
      });
    });

    describe("when value is number", () => {
      const obj = toJsonComparables({
        key: new Eq(1234),
      });

      it("should return Eq instance", () => {
        expect(restoreComparables(obj)).toStrictEqual({
          key: new Eq(1234),
        });
      });
    });

    describe("when value is bool", () => {
      const obj = toJsonComparables({
        key: new Eq(true),
      });

      it("should return Eq instance", () => {
        expect(restoreComparables(obj)).toStrictEqual({
          key: new Eq(true),
        });
      });
    });
  });

  describe("when obj is for gt", () => {
    it("should return Gt instance", () => {
      const obj = toJsonComparables({
        key: new Gt(1234),
      });

      expect(restoreComparables(obj)).toStrictEqual({
        key: new Gt(1234),
      });
    });
  });

  describe("when obj is for gte", () => {
    it("should return Gte instance", () => {
      const obj = toJsonComparables({
        key: new Gte(1234),
      });

      expect(restoreComparables(obj)).toStrictEqual({
        key: new Gte(1234),
      });
    });
  });

  describe("when obj is for lt", () => {
    it("should return Lt instance", () => {
      const obj = toJsonComparables({
        key: new Lt(1234),
      });

      expect(restoreComparables(obj)).toStrictEqual({
        key: new Lt(1234),
      });
    });
  });

  describe("when obj is for lte", () => {
    it("should return Lte instance", () => {
      const obj = toJsonComparables({
        key: new Lte(1234),
      });

      expect(restoreComparables(obj)).toStrictEqual({
        key: new Lte(1234),
      });
    });
  });

  describe("when obj is for reg", () => {
    describe("when value doesn't have flag", () => {
      it("should return Reg instance", () => {
        const obj = toJsonComparables({
          key: new Reg(/^abc/),
        });

        expect(restoreComparables(obj)).toStrictEqual({
          key: new Reg(/^abc/),
        });
      });
    });

    describe("when value has flag", () => {
      it("should return Reg instance", () => {
        const obj = toJsonComparables({
          key: new Reg(/^abc/gi),
        });

        expect(restoreComparables(obj)).toStrictEqual({
          key: new Reg(/^abc/gi),
        });
      });
    });
  });
});
