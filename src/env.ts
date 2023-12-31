export function setTmpDirToEnv(tmpDir: string): void {
  process.env.__ECHOED_TMPDIR__ = tmpDir;
}

export function getTmpDirFromEnv(): string | undefined {
  return process.env.__ECHOED_TMPDIR__;
}
