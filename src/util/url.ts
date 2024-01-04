/**
 * Remove query and hash from path
 * @param path
 *
 * @example
 * removeQueryAndHashFromPath("/api/cart?aaa#bbb") // => "/api/cart"
 */
export function removeQueryAndHashFromPath(path: string): string {
  return path.split(/[?#]/)[0];
}

/**
 * Remove leading slash from path
 * @param path
 *
 * @example
 * normalizePath("/api/cart") // => "api/cart"
 * normalizePath("api/cart") // => "api/cart"
 */
export function normalizePath(path: string): string {
  return path.replace(/^\//, "");
}
