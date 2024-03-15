export class EchoedFatalError extends Error {
  origMsg: string;

  constructor(msg: string) {
    super("Echoed: Fatal Error. " + msg);

    this.name = new.target.name;
    this.origMsg = msg;
  }
}
