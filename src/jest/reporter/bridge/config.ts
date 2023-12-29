import { PropagationTestConfig as InternalPropagationTestConfig } from "@/config/propagationTestConfig";
import { Comparable } from "@/comparision/comparable";
import { Eq } from "@/comparision/eq";
import { PropagationTestConfig } from "@/jest/reporter/reporter";

export function convertPropagationTestConfig(
  t?: PropagationTestConfig,
): InternalPropagationTestConfig {
  const enabled = t?.enabled === undefined ? true : t.enabled;
  const ignoreConfig = {
    attributes: convertToEqComparable(t?.ignore?.attributes),
    resource: {
      attributes: convertToEqComparable(t?.ignore?.resource?.attributes),
    },
  };

  return new InternalPropagationTestConfig({
    enabled,
    ignore: ignoreConfig,
  });
}

function convertToEqComparable(
  values: Record<string, string | boolean | number> | undefined,
): Map<string, Comparable> {
  if (!values) return new Map();

  const ret = new Map();
  for (const [key, val] of Object.entries(values)) {
    ret.set(key, new Eq(val));
  }
  return ret;
}
