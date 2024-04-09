import { ICypressObj } from "@/integration/cypress/internal/infra/iCypressObj";

const SERVER_PORT_KEY = "__ECHOED_SERVER_PORT__";
const TMP_DIR_KEY = "__ECHOED_TMP_DIR__";

export function setServerPortToCypressEnv(
  options: Cypress.PluginConfigOptions,
  port: number,
): void {
  options.env[SERVER_PORT_KEY] = port.toString();
}

export function getServerPortFromCypressEnv(
  cyObj: ICypressObj,
): number | undefined {
  const port = cyObj.env(SERVER_PORT_KEY) as string | undefined;
  if (!port) return undefined;

  return parseInt(port) || undefined;
}

export function setTmpDirToCypressEnv(
  options: Cypress.PluginConfigOptions,
  tmpDir: string,
): void {
  options.env[TMP_DIR_KEY] = tmpDir;
}

export function getTmpDirFromCypressEnv(
  cyObj: ICypressObj,
): string | undefined {
  return cyObj.env(TMP_DIR_KEY) as string | undefined;
}
