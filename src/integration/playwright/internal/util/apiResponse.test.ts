import {
  getTraceIdFromAPIResponse,
  readAPIResponseText,
  setTraceIdToAPIResponse,
} from "@/integration/playwright/internal/util/apiResponse";
import { buildPlaywrightApiResponse } from "@/testUtil/playwright/apiResponse";
import { Base64String } from "@/type/base64String";

describe("setTraceIdToResponse", () => {
  it("should set traceId to response", () => {
    const response = buildPlaywrightApiResponse();
    const traceId = new Base64String("dummy-trace-id");

    setTraceIdToAPIResponse(response, traceId);

    expect(getTraceIdFromAPIResponse(response)).toEqual(traceId);
  });
});

describe("readAPIResponseText", () => {
  describe("when content-type is text/plain", () => {
    it("should set traceId to response", async () => {
      const response = buildPlaywrightApiResponse({
        headers: { "content-type": "text/plain" },
        body: "response text",
      });

      const text = await readAPIResponseText(response);
      expect(text).toEqual("response text");
    });
  });

  describe("when content-type is application/json", () => {
    it("should set traceId to response", async () => {
      const response = buildPlaywrightApiResponse({
        headers: { "content-type": "application/json" },
        body: "response text",
      });

      const text = await readAPIResponseText(response);
      expect(text).toEqual("response text");
    });
  });

  describe("when content-type is not text", () => {
    it("should set traceId to response", async () => {
      const response = buildPlaywrightApiResponse({
        headers: { "content-type": "application/octet-stream" },
        body: "response text",
      });

      const text = await readAPIResponseText(response);
      expect(text).toContain("Not displayable");
    });
  });
});
