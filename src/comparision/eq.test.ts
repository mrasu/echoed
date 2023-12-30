import { Eq } from "@/comparision/eq";

describe("Eq", () => {
  describe("matchIAnyValue", () => {
    describe("when comparing value is string", () => {
      const value = new Eq("1234");

      describe("when argument is the same string", () => {
        it("should return true", () => {
          const target = {
            stringValue: "1234",
          };
          expect(value.matchIAnyValue(target)).toBe(true);
        });
      });

      describe("when argument is not the same string", () => {
        it("should return false", () => {
          const target = {
            stringValue: "hello",
          };
          expect(value.matchIAnyValue(target)).toBe(false);
        });
      });
      describe("when argument is int value", () => {
        it("should return true", () => {
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

    describe("when comparing value is number", () => {
      const value = new Eq(1234);

      describe("when argument is string", () => {
        it("should return false", () => {
          const target = {
            stringValue: "1234",
          };
          expect(value.matchIAnyValue(target)).toBe(false);
        });
      });

      describe("when argument is the same int value", () => {
        it("should return true", () => {
          const target = {
            intValue: 1234,
          };
          expect(value.matchIAnyValue(target)).toBe(true);
        });
      });

      describe("when argument is not the same int value", () => {
        it("should return true", () => {
          const target = {
            intValue: 1111,
          };
          expect(value.matchIAnyValue(target)).toBe(false);
        });
      });

      describe("when target is the same double value", () => {
        it("should return true", () => {
          const target = {
            doubleValue: 1234,
          };
          expect(value.matchIAnyValue(target)).toBe(true);
        });
      });

      describe("when target is not the same double value", () => {
        it("should return false", () => {
          const target = {
            doubleValue: 1111,
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

    describe("when comparing value is bool", () => {
      const value = new Eq(true);

      describe("when argument is string", () => {
        it("should return false", () => {
          const target = {
            stringValue: "true",
          };
          expect(value.matchIAnyValue(target)).toBe(false);
        });
      });

      describe("when argument is int value", () => {
        it("should return true", () => {
          const target = {
            intValue: 1234,
          };
          expect(value.matchIAnyValue(target)).toBe(false);
        });
      });

      describe("when target is double value", () => {
        it("should return true", () => {
          const target = {
            doubleValue: 1234,
          };
          expect(value.matchIAnyValue(target)).toBe(false);
        });
      });

      describe("when target is the same bool value", () => {
        it("should return false", () => {
          const target = {
            boolValue: true,
          };
          expect(value.matchIAnyValue(target)).toBe(true);
        });
      });

      describe("when target is not the same bool value", () => {
        it("should return false", () => {
          const target = {
            boolValue: false,
          };
          expect(value.matchIAnyValue(target)).toBe(false);
        });
      });
    });
  });
  describe("matchString", () => {
    describe("when comparing value is string", () => {
      const value = new Eq("1234");

      describe("when argument is the same string", () => {
        it("should return true", () => {
          expect(value.matchString("1234")).toBe(true);
        });
      });

      describe("when argument is not the same string", () => {
        it("should return false", () => {
          expect(value.matchString("hello")).toBe(false);
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

      describe("when comparing value is number", () => {
        const value = new Eq(1234);

        describe("when argument is string", () => {
          it("should return false", () => {
            expect(value.matchString("1234")).toBe(false);
          });
        });
      });

      describe("when comparing value is boolean", () => {
        const value = new Eq(true);

        describe("when argument is string", () => {
          it("should return false", () => {
            expect(value.matchString("true")).toBe(false);
          });
        });
      });
    });
  });

  describe("toJSON", () => {
    describe("when comparing value is string", () => {
      const value = new Eq("1234");

      it("should return JSON", () => {
        expect(value.toJSON()).toEqual({
          kind: "eq",
          value: "1234",
        });
      });
    });

    describe("when comparing value is number", () => {
      const value = new Eq(1234);

      it("should return JSON", () => {
        expect(value.toJSON()).toEqual({
          kind: "eq",
          value: 1234,
        });
      });
    });

    describe("when comparing value is boolean", () => {
      const value = new Eq(true);

      it("should return JSON", () => {
        expect(value.toJSON()).toEqual({
          kind: "eq",
          value: true,
        });
      });
    });
  });

  describe("fromJsonObj", () => {
    it("should create Eq from object", () => {
      const obj = {
        kind: "eq",
        value: "1234",
      };
      expect(Eq.fromJsonObj(obj)).toStrictEqual(new Eq("1234"));
    });
  });
});
