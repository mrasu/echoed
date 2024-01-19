const sleepingCallbackIntervalMs = 1000;
type sleepingCallbackFn = () => void;

export async function sleep(
  ms: number,
  sleeping: sleepingCallbackFn = (): void => {},
): Promise<void> {
  let waitMs = 0;
  while (waitMs < ms) {
    if (waitMs > 0) {
      sleeping();
    }

    const nextMs = Math.min(ms - waitMs, sleepingCallbackIntervalMs);
    await new Promise((res) => setTimeout(res, nextMs));
    waitMs += nextMs;
  }
}
