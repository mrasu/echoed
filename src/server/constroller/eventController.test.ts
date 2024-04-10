import { EventBus } from "@/eventBus/infra/eventBus";
import { MemoryBus } from "@/eventBus/infra/memoryBus";
import { WaitForSpanEvent } from "@/eventBus/parameter";
import { SpanBus } from "@/eventBus/spanBus";
import { WaitForSpanRequest } from "@/eventBus/waitForSpanRequest";
import { EventController } from "@/server/constroller/eventController";
import { StateEventRequestParam } from "@/server/parameter/stateParameter";
import { TestFinishedEventRequestParam } from "@/server/parameter/testFinishedParameter";
import { WaitForSpanEventRequestParam } from "@/server/parameter/waitForSpanParameter";
import { StateService } from "@/server/service/stateService";
import { TestRecordService } from "@/server/service/testRecordService";
import { WaitForSpanService } from "@/server/service/waitForSpanService";
import { StateStore } from "@/server/store/stateStore";
import { TestCaseStore } from "@/server/store/testCaseStore";
import { buildSpanId, buildTraceId } from "@/testUtil/otel/id";
import { buildTestCase } from "@/testUtil/report/testCase";
import { OtelSpan } from "@/type/otelSpan";

describe("EventController", () => {
  const buildController = ({
    bus,
    testCaseStore,
    stateStore,
  }: {
    bus?: EventBus;
    testCaseStore?: TestCaseStore;
    stateStore?: StateStore;
  } = {}): EventController => {
    return new EventController(
      new WaitForSpanService(bus ?? new MemoryBus()),
      new TestRecordService(testCaseStore ?? new TestCaseStore()),
      new StateService(stateStore ?? new StateStore()),
    );
  };

  describe("waitForSpan", () => {
    const traceId = buildTraceId();

    const requestParam: WaitForSpanEventRequestParam = {
      base64TraceId: traceId.base64String,
      filter: {
        attributes: {},
        resource: {
          attributes: {},
        },
      },
      waitTimeoutMs: 0,
    };

    describe("when span found", () => {
      it("should return span", async () => {
        const spanName = "test-span-name";

        const bus = new MemoryBus();
        const spanBus = new SpanBus(bus);
        spanBus.listenWaitForSpanEvent(
          async (event: WaitForSpanEvent): Promise<void> => {
            const request = new WaitForSpanRequest(spanBus, event);

            await request.respond(
              new OtelSpan({
                name: spanName,
                traceId: traceId.uint8Array,
                parentSpanId: buildSpanId().uint8Array,
                spanId: buildSpanId().uint8Array,
              }),
            );
          },
        );
        const controller = buildController({ bus: bus });

        const res = await controller.waitForSpan(JSON.stringify(requestParam));
        expect("span" in res).toBe(true);
        if ("span" in res) {
          expect(res.span.name).toBe(spanName);
        } else {
          throw new Error("unexpected path");
        }
      });
    });

    describe("when span not found", () => {
      it("should return timeout error", async () => {
        const controller = buildController();

        const res = await controller.waitForSpan(JSON.stringify(requestParam));
        expect("error" in res).toBe(true);
        if ("error" in res) {
          expect(res.reason).toBe("timeout");
        } else {
          throw new Error("unexpected path");
        }
      });
    });
  });

  describe("testFinished", () => {
    it("should record test cases", async () => {
      const testCaseStore = new TestCaseStore();
      const controller = buildController({ testCaseStore: testCaseStore });

      const testCases: TestFinishedEventRequestParam = [
        {
          file: "test-file",
          testCases: [buildTestCase({ testId: "test-id" })],
        },
      ];
      const res = await controller.testFinished(JSON.stringify(testCases));

      expect(res.success).toBe(true);
      expect(testCaseStore.capturedTestCases.size).toEqual(1);
      const testcases = testCaseStore.capturedTestCases.get("test-file");
      expect(testcases?.length).toEqual(1);
      expect(testcases?.pop()?.testId).toEqual("test-id");
    });
  });

  describe("stateChanged", () => {
    it("should record state", async () => {
      const stateStore = new StateStore();
      const controller = buildController({ stateStore: stateStore });

      const event: StateEventRequestParam = {
        name: "state-name",
        state: "start",
      };
      const res = await controller.stateChanged(JSON.stringify(event));

      expect(res.success).toBe(true);
      expect(stateStore.states).toEqual(new Map([["state-name", "start"]]));
    });
  });
});
