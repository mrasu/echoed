import { Gt } from "@/comparision/gt";

describe("Gt", () => {
  describe("matchIAnyValue", () => {
    const value = new Gt(1234);

    describe("when argument is string", () => {
      it("should return false", () => {
        const target = {
          stringValue: "1234",
        };
        expect(value.matchIAnyValue(target)).toBe(false);
      });
    });

    describe("when argument is equal int value", () => {
      it("should return false", () => {
        const target = {
          intValue: 1234,
        };
        expect(value.matchIAnyValue(target)).toBe(false);
      });
    });

    describe("when argument is greater int value", () => {
      it("should return true", () => {
        const target = {
          intValue: 1235,
        };
        expect(value.matchIAnyValue(target)).toBe(true);
      });
    });

    describe("when target is equal double value", () => {
      it("should return false", () => {
        const target = {
          doubleValue: 1234,
        };
        expect(value.matchIAnyValue(target)).toBe(false);
      });
    });

    describe("when target is greater double value", () => {
      it("should return true", () => {
        const target = {
          doubleValue: 1234.1,
        };
        expect(value.matchIAnyValue(target)).toBe(true);
      });
    });

    describe("when target is bool value", () => {
      it("should return false", () => {
        const target = {
          boolValue: true,
        };
        expect(value.matchIAnyValue(target)).toBe(false);
      });
    });
  });
});

describe("matchString", () => {
  const value = new Gt(1234);

  describe("when argument is string value", () => {
    it("should return true", () => {
      expect(value.matchString("1234")).toBe(false);
    });
  });

  describe("when argument is null", () => {
    it("should return false", () => {
      expect(value.matchString(null)).toBe(false);
    });
  });

  describe("when argument is undefined", () => {
    it("should return false", () => {
      expect(value.matchString(undefined)).toBe(false);
    });
  });

  describe("toJSON", () => {
    const value = new Gt(1234);

    it("should return JSON", () => {
      expect(value.toJSON()).toEqual({
        kind: "gt",
        value: 1234,
      });
    });
  });

  describe("fromJsonObj", () => {
    it("should create Gt from object", () => {
      const obj = {
        kind: "gt",
        value: 1234,
      };
      expect(Gt.fromJsonObj(obj)).toStrictEqual(new Gt(1234));
    });
  });
});
