export function neverVisit(message: string, x: never): never {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`${message}: ${x}`);
}
