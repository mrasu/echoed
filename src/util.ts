import fs from "fs";

export async function sleep(ms: number) {
  await new Promise((res) => setTimeout(res, ms));
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
