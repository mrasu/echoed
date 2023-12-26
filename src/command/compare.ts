export function eq(value: Primitive): CompareEq {
  return { kind: "eq", value };
}

export function gt(value: number): CompareNumber {
  return { kind: "gt", value };
}

export function gte(value: number): CompareNumber {
  return { kind: "gte", value };
}

export function lt(value: number): CompareNumber {
  return { kind: "lt", value };
}

export function lte(value: number): CompareNumber {
  return { kind: "lte", value };
}

type Primitive = string | number | boolean;

export type Compare = CompareEq | CompareNumber;

type CompareEq = {
  kind: "eq";
  value: Primitive;
};

type CompareNumber = {
  kind: ["gt", "gte", "lt", "lte"][number];
  value: number;
};
