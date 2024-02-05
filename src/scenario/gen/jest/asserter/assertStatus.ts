import { EchoedAssertContext } from "@/scenario/gen/common/context";
import { Option } from "@/scenario/gen/common/type";
import { Asserter } from "@/scenario/gen/jest/asserter/asserter";

/**
 * Assert status code of Response of fetch is the same with expected
 */
export const assertStatus = (
  _ctx: EchoedAssertContext,
  response: Response,
  expectedStatusCode: number,
  _option: Option,
): Promise<void> => {
  expect(response.status).toBe(expectedStatusCode);

  return Promise.resolve();
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _check: Asserter = assertStatus;
