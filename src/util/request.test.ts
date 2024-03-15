import { isReadableContentType } from "@/util/request";

describe("isReadableContentType", () => {
  describe("when content type is application/json", () => {
    it("should return true", () => {
      expect(isReadableContentType("application/json")).toBe(true);
    });
  });

  describe("when content type is text/html", () => {
    it("should return true", () => {
      expect(isReadableContentType("text/html")).toBe(true);
    });
  });

  describe("when content type is application/octet-stream", () => {
    it("should return false", () => {
      expect(isReadableContentType("application/octet-stream")).toBe(false);
    });
  });
});
