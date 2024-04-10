import { WaitForSpanRequest } from "@/eventBus/waitForSpanRequest";
import { Mutex } from "async-mutex";

export class WaitForSpanRequestStore {
  private waitForSpanRequests = new Map<string, WaitForSpanRequest[]>();

  constructor(private spanMutex: Mutex) {}

  async update(
    traceId: string,
    fn: (existings: WaitForSpanRequest[]) => WaitForSpanRequest[],
  ): Promise<void> {
    await this.spanMutex.runExclusive(() => {
      const requests = this.waitForSpanRequests.get(traceId) ?? [];
      const updatedRequests = fn(requests);
      this.waitForSpanRequests.set(traceId, updatedRequests);
    });
  }
}
