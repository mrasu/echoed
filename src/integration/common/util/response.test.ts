import { readResponseText } from "@/integration/common/util/response";

describe("readResponseText", () => {
  describe("when content-type is text/plain", () => {
    it("returns response text", async () => {
      const response = new Response("response text", {
        headers: { "content-type": "text/plain" },
      });

      expect(await readResponseText(response)).toBe("response text");
    });
  });

  describe("when content-type is application/json", () => {
    it("returns response text", async () => {
      const response = new Response('{"key": "value"}', {
        headers: { "content-type": "application/json" },
      });

      expect(await readResponseText(response)).toBe('{"key": "value"}');
    });
  });

  describe("when content-type is not readable", () => {
    it("returns a message", async () => {
      const response = new Response("response text", {
        headers: { "content-type": "application/octet-stream" },
      });

      expect(await readResponseText(response)).toContain("Not displayable");
    });
  });
});
