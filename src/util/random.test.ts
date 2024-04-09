import { buildRandomHexBytes, buildRandomHexUUID } from "@/util/random";

describe("buildRandomHexUUID", () => {
  it("should return hex string of length 32", () => {
    const res = buildRandomHexUUID();
    expect(res.length).toBe(32);
  });
});

describe("buildRandomHexBytes", () => {
  it("should return hex string of specified byte size", () => {
    const length = 3;
    const res = buildRandomHexBytes(length);
    expect(res.length).toBe(length * 2);
  });
});
