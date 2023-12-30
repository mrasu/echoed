import { Reg } from "@/comparision/reg";

describe("Reg", () => {
  describe("matchIAnyValue", () => {
    describe("when comparing regex doesn't have flag", () => {
      const value = new Reg(/^1234/);

      describe("when argument matches", () => {
        it("should return true", () => {
          const target = {
            stringValue: "12345678",
          };
          expect(value.matchIAnyValue(target)).toBe(true);
        });
      });

      describe("when argument doesn't match", () => {
        it("should return false", () => {
          const target = {
            stringValue: "abc1234",
          };
          expect(value.matchIAnyValue(target)).toBe(false);
        });
      });
      describe("when argument is int value", () => {
        it("should return false", () => {
          const target = {
            intValue: 1234,
          };
          expect(value.matchIAnyValue(target)).toBe(false);
        });
      });

      describe("when target is double value", () => {
        it("should return false", () => {
          const target = {
            doubleValue: 1234,
          };
          expect(value.matchIAnyValue(target)).toBe(false);
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

    describe("when comparing regex has flag", () => {
      const value = new Reg(/^abc/i);

      describe("when argument matches", () => {
        it("should return true", () => {
          const target = {
            stringValue: "ABC1234",
          };
          expect(value.matchIAnyValue(target)).toBe(true);
        });
      });

      describe("when argument doesn't match", () => {
        it("should return false", () => {
          const target = {
            stringValue: "1234abcd",
          };
          expect(value.matchIAnyValue(target)).toBe(false);
        });
      });
    });
  });

  describe("matchString", () => {
    describe("when comparing regex doesn't have flag", () => {
      const value = new Reg(/^1234/);

      describe("when argument matches", () => {
        it("should return true", () => {
          expect(value.matchString("12345678")).toBe(true);
        });
      });

      describe("when argument doesn't match", () => {
        it("should return false", () => {
          expect(value.matchString("abc1234")).toBe(false);
        });
      });
      describe("when argument is null", () => {
        it("should return false", () => {
          expect(value.matchString(null)).toBe(false);
        });
      });

      describe("when target is undefined", () => {
        it("should return false", () => {
          expect(value.matchString(undefined)).toBe(false);
        });
      });
    });

    describe("when comparing regex has flag", () => {
      const value = new Reg(/^abc/i);

      describe("when argument matches", () => {
        it("should return true", () => {
          expect(value.matchString("ABC1234")).toBe(true);
        });
      });

      describe("when argument doesn't match", () => {
        it("should return false", () => {
          expect(value.matchString("1234abcd")).toBe(false);
        });
      });
    });
  });

  describe("toJSON", () => {
    describe("when comparing value doesn't have flag", () => {
      const value = new Reg(/^abc/);

      it("should return JSON", () => {
        expect(value.toJSON()).toEqual({
          kind: "reg",
          source: "^abc",
          flags: "",
        });
      });
    });

    describe("when comparing value has flag", () => {
      const value = new Reg(/^abc/i);

      it("should return JSON", () => {
        expect(value.toJSON()).toEqual({
          kind: "reg",
          source: "^abc",
          flags: "i",
        });
      });
    });
  });

  describe("fromJsonObj", () => {
    describe("when object doesn't have flag", () => {
      const obj = {
        kind: "reg",
        source: "^abc",
        flags: "",
      };

      it("should return Reg instance", () => {
        expect(Reg.fromJsonObj(obj)).toStrictEqual(new Reg(/^abc/));
      });
    });

    describe("when comparing value has flag", () => {
      const obj = {
        kind: "reg",
        source: "^abc",
        flags: "ig",
      };

      it("should return Reg instance", () => {
        expect(Reg.fromJsonObj(obj)).toStrictEqual(new Reg(/^abc/gi));
      });
    });
  });
});
