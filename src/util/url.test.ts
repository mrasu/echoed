import { normalizePath, removeQueryAndHashFromPath } from "@/util/url";

describe("removeQueryAndHashFromPath", () => {
  describe("when path has no query or hash", () => {
    it("returns the path", () => {
      expect(removeQueryAndHashFromPath("/api/cart")).toBe("/api/cart");
    });
  });

  describe("when path has query", () => {
    it("returns the path without query", () => {
      expect(removeQueryAndHashFromPath("/api/cart?aaa")).toBe("/api/cart");
    });
  });

  describe("when path has hash", () => {
    it("returns the path without hash", () => {
      expect(removeQueryAndHashFromPath("/api/cart#bbb")).toBe("/api/cart");
    });
  });

  describe("when path has query and hash", () => {
    it("returns the path without query and hash", () => {
      expect(removeQueryAndHashFromPath("/api/cart?aaa#bbb")).toBe("/api/cart");
    });
  });
});

describe("normalizePath", () => {
  describe("when path has leading slash", () => {
    it("returns the path without leading slash", () => {
      expect(normalizePath("/api/cart")).toBe("api/cart");
    });
  });

  describe("when path has no leading slash", () => {
    it("returns the path", () => {
      expect(normalizePath("api/cart")).toBe("api/cart");
    });
  });
});
