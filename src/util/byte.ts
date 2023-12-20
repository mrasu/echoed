export function hexToBase64(hex: string): string {
  return Buffer.from(hex, "hex").toString("base64");
}

export function toBase64(bytes: Uint8Array | null | undefined): string {
  if (!bytes || bytes.length === 0) {
    return "";
  }
  return Buffer.from(bytes).toString("base64");
}
