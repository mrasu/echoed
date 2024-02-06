const KINDS = ["eq", "gt", "gte", "lt", "lte", "reg"] as const;
export type Kind = (typeof KINDS)[number];
