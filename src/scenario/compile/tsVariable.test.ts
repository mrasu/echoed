import { TemplateString } from "@/scenario/compile/templateString";
import { TsVariable } from "@/scenario/compile/tsVariable";

describe("TsVariable", () => {
  describe("parse", () => {
    it("should return TsVariable", () => {
      const variable = TsVariable.parse({
        foo: "bar",
      });

      expect(variable).toEqual(
        new TsVariable(
          new Map([["foo", new TsVariable(new TemplateString("bar"))]]),
        ),
      );
    });
  });

  describe("parseRecord", () => {
    it("should return record of TsVariable", () => {
      const variable = TsVariable.parseRecord({
        foo: "bar",
        buz: { qux: 1 },
      });

      expect(variable).toEqual(
        new Map([
          ["foo", new TsVariable(new TemplateString("bar"))],
          ["buz", new TsVariable(new Map([["qux", new TsVariable(1)]]))],
        ]),
      );
    });
  });

  describe("toTsLine", () => {
    describe("when value is null", () => {
      it("should return null", () => {
        const variable = new TsVariable(null);

        expect(variable.toTsLine()).toEqual("null");
      });
    });

    describe("when value is IString", () => {
      it("should return string", () => {
        const variable = new TsVariable(new TemplateString("foo"));

        expect(variable.toTsLine()).toEqual("`foo`");
      });
    });

    describe("when value is boolean", () => {
      it("should return string", () => {
        const variable = new TsVariable(true);

        expect(variable.toTsLine()).toEqual("true");
      });
    });

    describe("when value is number", () => {
      it("should return string", () => {
        const variable = new TsVariable(1);

        expect(variable.toTsLine()).toEqual("1");
      });
    });

    describe("when value is array", () => {
      it("should return string of array", () => {
        const variable = new TsVariable([
          new TsVariable(1),
          new TsVariable(true),
        ]);

        expect(variable.toTsLine()).toEqual("[1,true]");
      });
    });

    describe("when value is Map", () => {
      it("should return string of object", () => {
        const variable = new TsVariable(
          new Map([
            ["foo", new TsVariable(new TemplateString("bar"))],
            ["buz-a", new TsVariable(1)],
          ]),
        );

        expect(variable.toTsLine()).toEqual(`{"foo": \`bar\`,"buz-a": 1,}`);
      });
    });

    describe("when value is complex", () => {
      it("should return string of object", () => {
        const variable = TsVariable.parse({
          foo: "bar",
          buz: [
            {
              a: 1,
              b: true,
              c: [1, true, "${aaa}"],
            },
          ],
        });

        expect(variable.toTsLine()).toEqual(
          `{"foo": \`bar\`,"buz": [{"a": 1,"b": true,"c": [1,true,aaa],}],}`,
        );
      });
    });
  });
});
