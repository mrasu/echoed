import { readCypressResponseText } from "@/integration/cypress/internal/util/cypressResponse";
import { buildCypressHttpResponse } from "@/testUtil/cypress/httpResponse";

describe("readCypressResponseText", () => {
  describe("when the response is readable", () => {
    describe("when the body is string", () => {
      it("returns the response body as a string", () => {
        const response = buildCypressHttpResponse({
          body: "test body",
          headers: {
            "Content-Type": ["text/plain"],
          },
        });
        expect(readCypressResponseText(response)).toBe("test body");
      });
    });

    describe("when the body is object", () => {
      it("returns the response body as a string", () => {
        const response = buildCypressHttpResponse({
          body: { hello: "world" },
          headers: {
            "Content-Type": ["text/plain"],
          },
        });
        expect(readCypressResponseText(response)).toBe(
          JSON.stringify({ hello: "world" }),
        );
      });
    });
  });

  describe("when the content-type is not readable type", () => {
    it("returns the response 'Not displayable'", () => {
      const response = buildCypressHttpResponse({
        headers: {
          "Content-Type": ["application/octet-stream"],
        },
      });
      expect(readCypressResponseText(response)).toContain("[Not displayable.");
    });
  });

  describe("when the content-type doesn't exist", () => {
    it("returns the response 'Not displayable'", () => {
      const response = buildCypressHttpResponse({
        headers: {},
      });
      expect(readCypressResponseText(response)).toContain("[Not displayable.");
    });
  });
});
