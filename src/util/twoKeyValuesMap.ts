const GetResultTypes = ["found", "notFound1", "notFound2"] as const;
export type GetResultType = (typeof GetResultTypes)[number];

export class TwoKeyValuesMap<K1, K2, V> {
  private map = new Map<K1, Map<K2, V>>();

  get(k1: K1, k2: K2): V | undefined {
    const [value] = this.getWithType(k1, k2);
    return value;
  }

  getWithType(k1: K1, k2: K2): [V | undefined, GetResultType] {
    const map2 = this.map.get(k1);
    if (!map2) return [undefined, "notFound1"];
    const v = map2.get(k2);
    if (!v) return [undefined, "notFound2"];
    return [v, "found"];
  }

  set(k1: K1, k2: K2, v: V): void {
    let map2 = this.map.get(k1);
    if (!map2) {
      map2 = new Map<K2, V>();
      this.map.set(k1, map2);
    }
    map2.set(k2, v);
  }

  initOr(k1: K1, k2: K2, init: V, fn: (v: V) => void): void {
    const v = this.get(k1, k2);
    if (v) {
      fn(v);
    } else {
      this.set(k1, k2, init);
    }
  }

  entries(): [K1, K2, V][] {
    const ret: [K1, K2, V][] = [];
    for (const [k1, map1] of this.map.entries()) {
      for (const [k2, v] of map1.entries()) {
        ret.push([k1, k2, v]);
      }
    }
    return ret;
  }
}
