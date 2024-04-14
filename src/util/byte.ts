import { HexString } from "@/type/hexString";

export function toBase64String(bytes: Uint8Array | null | undefined): string {
  if (!bytes || bytes.length === 0) {
    return "";
  }
  return Buffer.from(bytes).toString("base64");
}

export function decodeBase64(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, "base64"));
}

export function toHexString(bytes: Uint8Array | null | undefined): string {
  if (!bytes || bytes.length === 0) {
    return "";
  }
  return Buffer.from(bytes).toString("hex");
}

export function toHex(bytes: Uint8Array | null | undefined): HexString {
  return new HexString(toHexString(bytes));
}
