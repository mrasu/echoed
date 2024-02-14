import { buildRelativeIndexableArray } from "@/util/proxy";

describe("buildRelativeIndexableArray", () => {
  it("should creates array accessible with negative index", () => {
    const orig = [1, 2, 3];
    const actual = buildRelativeIndexableArray(orig);

    expect(actual[0]).toBe(1);
    expect(actual[1]).toBe(2);
    expect(actual[2]).toBe(3);

    expect(actual[-1]).toBe(2);
    expect(actual[-2]).toBe(1);
  });
});
