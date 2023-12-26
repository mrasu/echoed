const KINDS = ["eq", "gt", "gte", "lt", "lte", "reg"] as const;
const KIND_SET: Set<string> = new Set(KINDS);
export type Kind = (typeof KINDS)[number];

export function toKind(kind: string): Kind | undefined {
  if (!KIND_SET.has(kind)) {
    throw new Error(`Unknown kind: ${kind}`);
  }

  return kind as Kind;
}
