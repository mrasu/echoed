import { Asserter } from "echoed/scenario/gen/jest/asserter";

export const assertItemLength: Asserter = (
  _ctx: unknown,
  items: unknown[],
  expectedLength: number,
): Promise<void> => {
  expect(items.length).toEqual(expectedLength);

  return Promise.resolve();
};
