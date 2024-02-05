import { assertStatus } from "@/scenario/gen/jest/asserter/assertStatus";
import { buildEchoedAssertContext } from "@/testUtil/scenario/context";

describe("assertStatus", () => {
  const execute = async (actual: number, expected: number): Promise<void> => {
    await assertStatus(
      buildEchoedAssertContext(),
      { status: actual } as Response,
      expected,
      {},
    );
  };

  describe("when actual status is the same with expected", () => {
    it("should not raise error", async () => {
      await execute(200, 200);
    });
  });

  describe("when actual status is not the same with expected", () => {
    it("should raise Jest's error", async () => {
      let errored = false;
      try {
        await execute(200, 400);
      } catch (e) {
        if (e && typeof e === "object" && "matcherResult" in e) {
          errored = true;
        } else {
          throw e;
        }
      }

      expect(errored).toBe(true);
    });
  });
});
