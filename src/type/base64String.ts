export class Base64String {
  constructor(public base64String: string) {}

  equals(other: Base64String): boolean {
    return this.base64String === other.base64String;
  }

  get uint8Array(): Uint8Array {
    return new Uint8Array(Buffer.from(this.base64String, "base64"));
  }
}
