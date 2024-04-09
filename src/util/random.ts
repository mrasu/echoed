import crypto from "crypto";

export function buildRandomHexUUID(): string {
  // Use `crypto.randomBytes()` instead of `crypto.randomUUID()` to create UUID because some Browser does not support `crypto.randomUUID()`.
  return buildRandomHexBytes(16);
}

export function buildRandomHexBytes(byteSize: number): string {
  return crypto.randomBytes(byteSize).toString("hex");
}
