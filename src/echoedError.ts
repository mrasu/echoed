export class EchoedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
