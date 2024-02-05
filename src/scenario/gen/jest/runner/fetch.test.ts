import { fetch, FetchResponse } from "@/scenario/gen/jest/runner/fetch";
import { buildEchoedActContext } from "@/testUtil/scenario/context";
import fetchMock from "jest-fetch-mock";

describe("fetch", () => {
  const responseBody = JSON.stringify({ data: "12345" });

  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    fetchMock.mockResponse(responseBody, { status: 201 });
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  const assertFetchResponse = (
    resp: FetchResponse,
    expectedStatus: number,
    expectedBody: string,
    expectedJSON: unknown,
  ): void => {
    expect(resp.response.status).toEqual(expectedStatus);
    expect(resp.textBody).toEqual(expectedBody);
    expect(resp.jsonBody).toEqual(expectedJSON);
  };

  describe("when no option is given", () => {
    describe("when only endpoint is given", () => {
      it("should access the specified endpoint", async () => {
        const resp = await fetch(
          buildEchoedActContext(),
          {
            endpoint: "http://localhost:3000",
          },
          {},
        );

        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][0]).toEqual("http://localhost:3000");
        assertFetchResponse(resp, 201, responseBody, { data: "12345" });
      });
    });

    describe("when method is given", () => {
      it("should use the method", async () => {
        const resp = await fetch(
          buildEchoedActContext(),
          {
            endpoint: "http://localhost:3000",
            method: "POST",
          },
          {},
        );

        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][1]!.method).toEqual("POST");
        assertFetchResponse(resp, 201, responseBody, { data: "12345" });
      });
    });

    describe("when jsonBody is given", () => {
      it("should use the jsonBody", async () => {
        const resp = await fetch(
          buildEchoedActContext(),
          {
            endpoint: "http://localhost:3000",
            method: "POST",
            jsonBody: { data: "dddd" },
          },
          {},
        );

        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][1]!.body).toEqual(
          JSON.stringify({ data: "dddd" }),
        );
        assertFetchResponse(resp, 201, responseBody, { data: "12345" });
      });
    });

    describe("when txtBody is given", () => {
      it("should use the txtBody", async () => {
        const resp = await fetch(
          buildEchoedActContext(),
          {
            endpoint: "http://localhost:3000",
            method: "POST",
            txtBody: "dummyBody",
          },
          {},
        );

        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][1]!.body).toEqual("dummyBody");
        assertFetchResponse(resp, 201, responseBody, { data: "12345" });
      });
    });

    describe("when headers is given", () => {
      it("should use the headers", async () => {
        const resp = await fetch(
          buildEchoedActContext(),
          {
            endpoint: "http://localhost:3000",
            headers: { foo: "bar" },
          },
          {},
        );

        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][1]!.headers).toEqual({ foo: "bar" });
        assertFetchResponse(resp, 201, responseBody, { data: "12345" });
      });
    });
  });

  describe("when option exists", () => {
    describe("when baseEndpoint is given", () => {
      it("should combine endpoint with the specified endpoint", async () => {
        const resp = await fetch(
          buildEchoedActContext(),
          {
            endpoint: "/api/cart",
          },
          {
            baseEndpoint: "http://localhost:3000",
          },
        );

        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][0]).toEqual(
          "http://localhost:3000/api/cart",
        );
        assertFetchResponse(resp, 201, responseBody, { data: "12345" });
      });
    });

    describe("when headers is given", () => {
      it("should combine headers", async () => {
        const resp = await fetch(
          buildEchoedActContext(),
          {
            endpoint: "http://localhost:3000",
            headers: { foo: "bar" },
          },
          {
            headers: { buz: "123" },
          },
        );

        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][1]?.headers).toEqual({
          foo: "bar",
          buz: "123",
        });
        assertFetchResponse(resp, 201, responseBody, { data: "12345" });
      });
    });
  });
});
