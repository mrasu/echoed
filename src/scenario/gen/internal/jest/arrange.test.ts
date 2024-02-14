import { wrapArrange } from "@/scenario/gen/internal/jest/arrange";

describe("wrapArrange", () => {
  it("should return merged variables", async () => {
    const initial = { hello: "world" };
    const actual = await wrapArrange(initial, async () => {
      return Promise.resolve({ foo: "bar" });
    });

    expect(actual).toEqual({ hello: "world", foo: "bar" });
    expect(initial).toEqual({ hello: "world" });
  });
});
