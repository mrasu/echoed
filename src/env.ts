export function setTmpDirToEnv(tmpDir: string): void {
  process.env.__TOBIKURA_TMPDIR__ = tmpDir;
}

export function getTmpDirFromEnv(): string | undefined {
  return process.env.__TOBIKURA_TMPDIR__;
}
