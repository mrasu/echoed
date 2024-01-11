import { Base64String } from "@/type/base64String";

export function hexToBase64(hex: string): Base64String {
  return toBase64(Buffer.from(hex, "hex"));
}

export function toBase64(bytes: Uint8Array | null | undefined): Base64String {
  if (!bytes || bytes.length === 0) {
    return new Base64String("");
  }
  return new Base64String(Buffer.from(bytes).toString("base64"));
}

export function decodeBase64(base64: string): Uint8Array {
  return new Base64String(base64).uint8Array;
}
