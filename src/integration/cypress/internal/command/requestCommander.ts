import { TestActionLogger } from "@/fileLog/testActionLogger";
import { TRACEPARENT_HEADER_KEY } from "@/integration/common/commonFetchRunner";
import { isEchoedRequestOption } from "@/integration/cypress/internal/util/cypressRequest";
import {
  readCypressResponseText,
  setTraceIdToCypressResponse,
} from "@/integration/cypress/internal/util/cypressResponse";
import { setTraceIdToCypressSpec } from "@/integration/cypress/internal/util/cypressSpec";
import { toDisplayableRequestBody } from "@/integration/cypress/internal/util/request";
import { Base64String } from "@/type/base64String";
import { generateTraceparent } from "@/util/traceparent";
import http from "http";

const HTTP_METHOD_SET = new Set(http.METHODS.map((m) => m.toLowerCase()));

export type RequestCommandArgs =
  | [string]
  | [string, Cypress.RequestBody]
  | [Cypress.HttpMethod, string]
  | [Cypress.HttpMethod, string, Cypress.RequestBody]
  | [Partial<Cypress.RequestOptions>];

export type ParamBag = {
  opts: Partial<Cypress.RequestOptions>;
  isEchoedRequest: boolean;
  requestUrl: string;
  traceparent: string;
  traceId: Base64String;
};

export class RequestCommander {
  constructor(
    private testActionLogger: TestActionLogger,
    private spec: Cypress.Spec,
  ) {}

  buildBag(args: RequestCommandArgs): ParamBag {
    const opts = this.toRequestOptions(args);
    const isEchoedRequest = isEchoedRequestOption(opts);
    const requestUrl = opts.url ?? "";

    const { traceparent, traceId } = generateTraceparent();
    opts.headers = {
      ...opts.headers,
      [TRACEPARENT_HEADER_KEY]: traceparent,
    };

    return { opts, isEchoedRequest, requestUrl, traceparent, traceId };
  }

  private toRequestOptions(
    args: RequestCommandArgs,
  ): Partial<Cypress.RequestOptions> {
    if (typeof args[0] === "object") {
      return { ...args[0] };
    }

    if (args.length === 1) {
      return { url: args[0] };
    }

    if (args.length === 2) {
      if (this.isValidHttpMethod(args[0])) {
        // When the first argument is HTTP method, the second argument is a URL.
        const url = args[1] as string;
        return {
          method: args[0],
          url: url,
        };
      } else {
        return {
          url: args[0],
          body: args[1],
        };
      }
    }

    return {
      method: args[0],
      url: args[1],
      body: args[2],
    };
  }

  private isValidHttpMethod(txt: unknown): boolean {
    if (typeof txt !== "string") return false;

    return HTTP_METHOD_SET.has(txt.toLowerCase());
  }

  async before(bag: ParamBag): Promise<void> {
    setTraceIdToCypressSpec(this.spec, bag.requestUrl, bag.traceId);
    await this.logFetchStarted(bag);
  }

  async after(
    res: Cypress.Response<unknown>,
    bag: ParamBag,
  ): Promise<Cypress.Response<unknown>> {
    setTraceIdToCypressResponse(res, bag.traceId);

    return this.logFetchFinished(res, bag);
  }

  private async logFetchStarted(bag: ParamBag): Promise<void> {
    if (bag.isEchoedRequest) return;

    await this.testActionLogger.logFetchStarted(
      undefined,
      bag.traceId,
      this.spec.relative,
      new Date(),
    );
  }

  private async logFetchFinished(
    res: Cypress.Response<unknown>,
    bag: ParamBag,
  ): Promise<Cypress.Response<unknown>> {
    if (bag.isEchoedRequest) return res;

    const responseText = readCypressResponseText(res);
    await this.testActionLogger.logFetchFinished(
      bag.traceId,
      {
        url: bag.requestUrl,
        method: bag.opts.method ?? "GET",
        body: toDisplayableRequestBody(bag.opts.body),
      },
      res.status,
      responseText,
    );
    return res;
  }
}
