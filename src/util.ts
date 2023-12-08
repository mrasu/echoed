import fs from "fs";

const sleepingCallbackIntervalMs = 1000;
type sleepingCallbackFn = () => void;

export async function sleep(ms: number, sleeping: sleepingCallbackFn) {
  let waitMs = 0;
  while (waitMs < ms) {
    if (waitMs > 0) {
      sleeping();
    }

    const nextMs = Math.min(ms - waitMs, sleepingCallbackIntervalMs);
    await new Promise((res) => setTimeout(res, nextMs));
    waitMs += nextMs;
  }
}

export function hexToBase64(hex: string): string {
  return Buffer.from(hex, "hex").toString("base64");
}

export function toBase64(bytes: Uint8Array | null | undefined): string {
  if (!bytes || bytes.length === 0) {
    return "";
  }
  return Buffer.from(bytes).toString("base64");
}

export async function appendFileLine(filepath: string, text: string) {
  await new Promise((resolve, reject) => {
    fs.appendFile(filepath, text + "\n", (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(undefined);
    });
  });
}
