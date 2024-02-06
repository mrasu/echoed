export class EchoedFatalError extends Error {
  constructor(message: string) {
    super("Echoed: Fatal Error. " + message);
    this.name = new.target.name;
  }
}
