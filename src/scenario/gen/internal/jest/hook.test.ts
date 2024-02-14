import { wrapHook } from "@/scenario/gen/internal/jest/hook";

describe("wrapHook", () => {
  it("should return merged variables", async () => {
    const initial = { hello: "world" };
    const actual = await wrapHook(initial, async () => {
      return Promise.resolve({ foo: "bar" });
    });

    expect(actual).toEqual({ hello: "world", foo: "bar" });
    expect(initial).toEqual({ hello: "world" });
  });
});
