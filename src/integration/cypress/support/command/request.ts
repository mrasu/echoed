import { EchoedFatalError } from "@/echoedFatalError";
import { TestActionLogger } from "@/fileLog/testActionLogger";
import {
  RequestCommandArgs,
  RequestCommander,
} from "@/integration/cypress/internal/command/requestCommander";
import { CypressFileLogger } from "@/integration/cypress/internal/infra/cypressFileLogger";
import { RunInfo } from "@/integration/cypress/internal/runInfo";

type RequestFn = Cypress.CommandOriginalFn<"request">;

export function request(
  runInfo: RunInfo,
  originalFn: RequestFn,
  ...args: RequestCommandArgs
): Cypress.Chainable<Cypress.Response<unknown>> {
  const spec = runInfo.currentSpec;
  if (!spec) {
    throw new EchoedFatalError(
      `Invalid state. no CurrentSpec. not using support?`,
    );
  }

  return runRequest(spec, runInfo.fileLogger, originalFn, args);
}

function runRequest(
  spec: Cypress.Spec,
  fileLogger: CypressFileLogger,
  originalFn: RequestFn,
  args: RequestCommandArgs,
): Cypress.Chainable<Cypress.Response<unknown>> {
  const testActionLogger = new TestActionLogger(fileLogger);
  const commander = new RequestCommander(testActionLogger, spec);
  const bag = commander.buildBag(args);

  return cy
    .wrap(commander.before(bag))
    .then({ timeout: bag.opts.timeout }, () => {
      return originalFn(bag.opts);
    })
    .then({}, (res) => {
      return commander.after(res, bag);
    });
}
