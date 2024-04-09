import {
  normalizeHeaders,
  normalizeRequestOptionHeaders,
} from "@/integration/cypress/internal/util/headers";

describe("normalizeHeaders", () => {
  describe("when the header is array", () => {
    it("should return normalized headers", () => {
      const headers = {
        "Content-Type": ["application/json"],
        "X-Auth-Token": ["token1", "token2"],
      };
      const normalized = normalizeHeaders(headers);

      expect(normalized).toEqual(
        new Map([
          ["Content-Type", ["application/json"]],
          ["X-Auth-Token", ["token1", "token2"]],
        ]),
      );
    });
  });

  describe("when the header is strings", () => {
    it("should return normalized headers", () => {
      const headers = {
        "Content-Type": "application/json",
        "X-Auth-Token": "token",
      };
      const normalized = normalizeHeaders(headers);

      expect(normalized).toEqual(
        new Map([
          ["Content-Type", ["application/json"]],
          ["X-Auth-Token", ["token"]],
        ]),
      );
    });
  });
});

describe("normalizeRequestOptionHeaders", () => {
  describe("when the header is array", () => {
    it("should return normalized headers", () => {
      const headers = {
        "Content-Type": ["application/json"],
        "X-Auth-Token": ["token1", "token2"],
      };
      const normalized = normalizeRequestOptionHeaders(headers);

      expect(normalized).toEqual(
        new Map([
          ["Content-Type", ["application/json"]],
          ["X-Auth-Token", ["token1", "token2"]],
        ]),
      );
    });
  });

  describe("when the header is strings", () => {
    it("should return normalized headers", () => {
      const headers = {
        "Content-Type": "application/json",
        "X-Auth-Token": "token",
      };
      const normalized = normalizeRequestOptionHeaders(headers);

      expect(normalized).toEqual(
        new Map([
          ["Content-Type", ["application/json"]],
          ["X-Auth-Token", ["token"]],
        ]),
      );
    });
  });

  describe("when the header is not set", () => {
    it("should return empty map", () => {
      const normalized = normalizeRequestOptionHeaders(undefined);

      expect(normalized).toEqual(new Map());
    });
  });
});
