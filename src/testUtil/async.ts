import { sleep } from "@/util/async";

const WAIT_LOOP_TICK_MS = 10;
const WAIT_LOOP_COUNT = 10;
export const MAX_WAIT_MS = WAIT_LOOP_TICK_MS * WAIT_LOOP_COUNT;

export async function waitUntilCalled<T, Y extends unknown[], C>(
  mock: jest.Mock<T, Y, C>,
  count: number = 1,
): Promise<void> {
  for (let i = 0; i < WAIT_LOOP_COUNT; i++) {
    if (mock.mock.calls.length >= count) {
      return;
    }
    await sleep(WAIT_LOOP_TICK_MS);
  }
}
