export function setTmpDirToEnv(tmpDir: string): void {
  process.env.__ECHOED_TMPDIR__ = tmpDir;
}

export function getTmpDirFromEnv(): string | undefined {
  return process.env.__ECHOED_TMPDIR__;
}

export function deleteTmpDirFromEnv(): void {
  delete process.env.__ECHOED_TMPDIR__;
}

export function setServerPortToEnv(port: number): void {
  process.env.__ECHOED_SERVER_PORT__ = port.toString();
}

export function getServerPortFromEnv(): number | undefined {
  const port = process.env.__ECHOED_SERVER_PORT__;
  if (!port) return undefined;

  return parseInt(port) || undefined;
}

export function deleteServerPortFromEnv(): void {
  delete process.env.__ECHOED_SERVER_PORT__;
}
