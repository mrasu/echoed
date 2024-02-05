import { RawString } from "@/scenario/compile/rawString";
import { TemplateString } from "@/scenario/compile/templateString";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { TsVariableParser } from "@/scenario/compile/tsVariableParser";

describe("TsVariableParser", () => {
  describe("parse", () => {
    describe("when schema is null", () => {
      it("should return TsVariable", () => {
        const variable = TsVariableParser.parse(null);

        expect(variable).toEqual(new TsVariable(null));
      });
    });

    describe("when schema is string", () => {
      it("should return TemplateString", () => {
        const variable = TsVariableParser.parse("foo");

        expect(variable).toEqual(new TsVariable(new TemplateString("foo")));
      });
    });

    describe("when schema is string and surrounded with ${}", () => {
      it("should return TemplateString", () => {
        const variable = TsVariableParser.parse("${foo}");

        expect(variable).toEqual(new TsVariable(new RawString("foo")));
      });
    });

    describe("when schema is array", () => {
      it("should return array of TsVariable", () => {
        const variable = TsVariableParser.parse(["foo", 1, true]);

        expect(variable).toEqual(
          new TsVariable([
            new TsVariable(new TemplateString("foo")),
            new TsVariable(1),
            new TsVariable(true),
          ]),
        );
      });
    });

    describe("when schema is object", () => {
      it("should return map of TsVariable", () => {
        const variable = TsVariableParser.parse({
          foo: "bar",
          buz: { qux: 1 },
        });

        expect(variable).toEqual(
          new TsVariable(
            new Map([
              ["foo", new TsVariable(new TemplateString("bar"))],
              ["buz", new TsVariable(new Map([["qux", new TsVariable(1)]]))],
            ]),
          ),
        );
      });
    });

    describe("when schema is boolean", () => {
      it("should return boolean", () => {
        const variable = TsVariableParser.parse(true);

        expect(variable).toEqual(new TsVariable(true));
      });
    });

    describe("when schema is number", () => {
      it("should return number", () => {
        const variable = TsVariableParser.parse(1);

        expect(variable).toEqual(new TsVariable(1));
      });
    });
  });
});
