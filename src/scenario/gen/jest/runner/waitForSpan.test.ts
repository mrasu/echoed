import {
  deleteServerPortFromEnv,
  setServerPortToEnv,
} from "@/integration/common/util/env";
import { setTraceIdToResponse } from "@/integration/common/util/fetchResponse";
import { waitForSpan } from "@/scenario/gen/jest/runner/waitForSpan";
import { WaitForSpanEventResponse } from "@/server/parameter/waitForSpanParameter";
import { buildEchoedActContext } from "@/testUtil/scenario/context";
import { buildJsonSpan } from "@/testUtil/type/jsonSpan";
import { HexString } from "@/type/hexString";
import { toBase64String } from "@/util/byte";
import fetchMock from "jest-fetch-mock";

describe("waitForSpan", () => {
  const span = buildJsonSpan({
    traceId: toBase64String(Uint8Array.from([1, 2, 3])),
    spanId: toBase64String(Uint8Array.from([11, 12, 13])),
    parentSpanId: toBase64String(Uint8Array.from([21, 22, 23])),
    attributes: [
      {
        key: "dummyAttr",
        value: { stringValue: "dummy-value" },
      },
    ],
    resource: {
      attributes: [
        {
          key: "dummyResourceAttr",
          value: { stringValue: "dummy-resource-value" },
        },
      ],
    },
  });

  beforeEach(() => {
    setServerPortToEnv(1);
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const response: WaitForSpanEventResponse = {
      span: span,
    };
    fetchMock.doMockIf(
      "http://localhost:1/events/waitForSpan",
      JSON.stringify(response),
    );
  });

  afterEach(() => {
    fetchMock.disableMocks();
    deleteServerPortFromEnv();
  });

  describe("call", () => {
    it("should return span", async () => {
      const response = {} as Response;
      setTraceIdToResponse(response, new HexString("dummy-trace-id"));
      const filter = {};

      const actual = await waitForSpan(
        buildEchoedActContext(),
        {
          response,
          filter,
        },
        {},
      );

      expect(actual.spanId).toEqual(Uint8Array.from([11, 12, 13]));
      expect(actual.getAttribute("dummyAttr")?.value?.stringValue).toEqual(
        "dummy-value",
      );
      expect(
        actual.resource.getAttribute("dummyResourceAttr")?.value?.stringValue,
      ).toEqual("dummy-resource-value");
    });
  });
});
