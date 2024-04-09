import { toDisplayableRequestBody } from "@/integration/cypress/internal/util/request";

describe("toDisplayableRequestBody", () => {
  describe("when the body is null", () => {
    it("should return null", () => {
      const body = null;
      const displayable = toDisplayableRequestBody(body);

      expect(displayable).toBe(null);
    });
  });

  describe("when the body is undefined", () => {
    it("should return null", () => {
      const body = undefined;
      const displayable = toDisplayableRequestBody(body);

      expect(displayable).toBe(null);
    });
  });

  describe("when the body is string", () => {
    it("should return the body", () => {
      const body = "body";
      const displayable = toDisplayableRequestBody(body);

      expect(displayable).toBe("body");
    });
  });

  describe("when the body is object", () => {
    it("should return not displayable message", () => {
      const body = { a: "b" };
      const displayable = toDisplayableRequestBody(body);

      expect(displayable).toBe("[Not displayable]");
    });
  });
});
