import { restoreComparables } from "@/comparision/restore";
import { Eq } from "@/comparision/eq";
import { Gt } from "@/comparision/gt";
import { Gte } from "@/comparision/gte";
import { Lt } from "@/comparision/lt";
import { Lte } from "@/comparision/lte";
import { Reg } from "@/comparision/reg";

describe("restoreComparables", () => {
  describe("when obj is for eq", () => {
    describe("when value is string", () => {
      const obj = JSON.parse(
        JSON.stringify({
          key: new Eq("abc"),
        }),
      ) as Record<string, unknown>;

      it("should return Eq instance", () => {
        expect(restoreComparables(obj)).toStrictEqual({
          key: new Eq("abc"),
        });
      });
    });

    describe("when value is number", () => {
      const obj = JSON.parse(
        JSON.stringify({
          key: new Eq(1234),
        }),
      ) as Record<string, unknown>;

      it("should return Eq instance", () => {
        expect(restoreComparables(obj)).toStrictEqual({
          key: new Eq(1234),
        });
      });
    });

    describe("when value is bool", () => {
      const obj = JSON.parse(
        JSON.stringify({
          key: new Eq(true),
        }),
      ) as Record<string, unknown>;

      it("should return Eq instance", () => {
        expect(restoreComparables(obj)).toStrictEqual({
          key: new Eq(true),
        });
      });
    });
  });

  describe("when obj is for gt", () => {
    it("should return Gt instance", () => {
      const obj = JSON.parse(
        JSON.stringify({
          key: new Gt(1234),
        }),
      ) as Record<string, unknown>;

      expect(restoreComparables(obj)).toStrictEqual({
        key: new Gt(1234),
      });
    });
  });

  describe("when obj is for gte", () => {
    it("should return Gte instance", () => {
      const obj = JSON.parse(
        JSON.stringify({
          key: new Gte(1234),
        }),
      ) as Record<string, unknown>;

      expect(restoreComparables(obj)).toStrictEqual({
        key: new Gte(1234),
      });
    });
  });

  describe("when obj is for lt", () => {
    it("should return Lt instance", () => {
      const obj = JSON.parse(
        JSON.stringify({
          key: new Lt(1234),
        }),
      ) as Record<string, unknown>;

      expect(restoreComparables(obj)).toStrictEqual({
        key: new Lt(1234),
      });
    });
  });

  describe("when obj is for lte", () => {
    it("should return Lte instance", () => {
      const obj = JSON.parse(
        JSON.stringify({
          key: new Lte(1234),
        }),
      ) as Record<string, unknown>;

      expect(restoreComparables(obj)).toStrictEqual({
        key: new Lte(1234),
      });
    });
  });

  describe("when obj is for reg", () => {
    describe("when value doesn't have flag", () => {
      it("should return Reg instance", () => {
        const obj = JSON.parse(
          JSON.stringify({
            key: new Reg(/^abc/),
          }),
        ) as Record<string, unknown>;

        expect(restoreComparables(obj)).toStrictEqual({
          key: new Reg(/^abc/),
        });
      });
    });

    describe("when value has flag", () => {
      it("should return Reg instance", () => {
        const obj = JSON.parse(
          JSON.stringify({
            key: new Reg(/^abc/gi),
          }),
        ) as Record<string, unknown>;

        expect(restoreComparables(obj)).toStrictEqual({
          key: new Reg(/^abc/gi),
        });
      });
    });
  });
});
