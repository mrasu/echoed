import { joinUrl, normalizePath, removeQueryAndHashFromPath } from "@/util/url";

describe("removeQueryAndHashFromPath", () => {
  describe("when path has no query or hash", () => {
    it("should return the path", () => {
      expect(removeQueryAndHashFromPath("/api/cart")).toBe("/api/cart");
    });
  });

  describe("when path has query", () => {
    it("should return the path without query", () => {
      expect(removeQueryAndHashFromPath("/api/cart?aaa")).toBe("/api/cart");
    });
  });

  describe("when path has hash", () => {
    it("should return the path without hash", () => {
      expect(removeQueryAndHashFromPath("/api/cart#bbb")).toBe("/api/cart");
    });
  });

  describe("when path has query and hash", () => {
    it("should return the path without query and hash", () => {
      expect(removeQueryAndHashFromPath("/api/cart?aaa#bbb")).toBe("/api/cart");
    });
  });
});

describe("normalizePath", () => {
  describe("when path has leading slash", () => {
    it("should return the path without leading slash", () => {
      expect(normalizePath("/api/cart")).toBe("api/cart");
    });
  });

  describe("when path has no leading slash", () => {
    it("should return the path", () => {
      expect(normalizePath("api/cart")).toBe("api/cart");
    });
  });
});

describe("joinUrl", () => {
  describe("when base has no trailing slash and url has no leading slash", () => {
    it("should return the joined url", () => {
      const result = joinUrl("https://example.com", "api/hello");
      expect(result).toBe("https://example.com/api/hello");
    });
  });

  describe("when base has trailing slash and url has no leading slash", () => {
    it("should return the joined url", () => {
      const result = joinUrl("https://example.com/api/", "hello");
      expect(result).toBe("https://example.com/api/hello");
    });
  });

  describe("when base has trailing slash and url has leading slash", () => {
    it("should return the url from root", () => {
      const result = joinUrl("https://example.com/api/", "/hello");
      expect(result).toBe("https://example.com/hello");
    });
  });

  describe("when url has leading `../`", () => {
    it("should return the joined url", () => {
      const result = joinUrl("https://example.com/api/v1", "../hello");
      expect(result).toBe("https://example.com/api/hello");
    });
  });

  describe("when url is absolute", () => {
    it("should return the url", () => {
      const result = joinUrl(
        "https://example.com/api",
        "https://example.com/api/hello",
      );
      expect(result).toBe("https://example.com/api/hello");
    });
  });

  describe("when base has query", () => {
    describe("when base has no trailing slash", () => {
      it("should ignore query", () => {
        const result = joinUrl("https://example.com/api?query", "hello");
        expect(result).toBe("https://example.com/api/hello");
      });
    });

    describe("when base has trailing slash", () => {
      it("should ignore query", () => {
        const result = joinUrl("https://example.com/api/?query", "hello");
        expect(result).toBe("https://example.com/api/hello");
      });
    });
  });

  describe("when base has hash", () => {
    describe("when base has no trailing slash", () => {
      it("should ignore hash", () => {
        const result = joinUrl("https://example.com/api#hash", "hello");
        expect(result).toBe("https://example.com/api/hello");
      });
    });

    describe("when base has trailing slash", () => {
      it("should ignore hash", () => {
        const result = joinUrl("https://example.com/api/#hash", "hello");
        expect(result).toBe("https://example.com/api/hello");
      });
    });
  });
});
