export class HexString {
  constructor(public hexString: string) {}

  equals(other: HexString): boolean {
    return this.hexString === other.hexString;
  }

  get uint8Array(): Uint8Array {
    return new Uint8Array(Buffer.from(this.hexString, "hex"));
  }
}
