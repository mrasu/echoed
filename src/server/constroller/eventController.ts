import { SuccessResponse } from "@/server/parameter/commonParameter";
import { StateEventRequestParam } from "@/server/parameter/stateParameter";
import {
  TestFinishedEventRequestParam,
  restoreTestCases,
} from "@/server/parameter/testFinishedParameter";
import {
  WaitForSpanEventRequestParam,
  WaitForSpanEventResponse,
  restoreWaitForSpanEventRequestParam,
} from "@/server/parameter/waitForSpanParameter";
import { StateService } from "@/server/service/stateService";
import { TestRecordService } from "@/server/service/testRecordService";
import { WaitForSpanService } from "@/server/service/waitForSpanService";
import { arrayToMap } from "@/util/map";

export class EventController {
  constructor(
    private waitForSpanService: WaitForSpanService,
    private testRecordService: TestRecordService,
    private stateService: StateService,
  ) {}

  async waitForSpan(body: string): Promise<WaitForSpanEventResponse> {
    const param = WaitForSpanEventRequestParam.parse(JSON.parse(body));
    const reqParam = restoreWaitForSpanEventRequestParam(param);

    const response = await this.waitForSpanService.handleWaitForSpanEvent(
      reqParam.traceId,
      reqParam.filter,
      reqParam.waitTimeoutMs,
    );

    if ("error" in response) {
      return response;
    } else {
      return { span: response };
    }
  }

  async testFinished(body: string): Promise<SuccessResponse> {
    const param = TestFinishedEventRequestParam.parse(JSON.parse(body));

    const tests = arrayToMap(param, (data) => {
      return [data.file, restoreTestCases(data.testCases)];
    });

    await this.testRecordService.recordFinished(tests);

    return { success: true };
  }

  async stateChanged(body: string): Promise<SuccessResponse> {
    const param = StateEventRequestParam.parse(JSON.parse(body));
    this.stateService.stateChanged(param.name, param.state);

    return Promise.resolve({ success: true });
  }
}
