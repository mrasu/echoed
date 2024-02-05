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

/**
 * Join baseEndpoint and endpoint
 * Note that whether endpoint is finished with slash or not, last part of baseEndpoint is considered as directory
 * @param baseOrig
 * @param url
 *
 * @example
 * joinUrl("https://example.com", "api/hello") // => "https://example.com/api/hello"
 * joinUrl("https://example.com/api", "hello") // => "https://example.com/api/hello"
 * joinUrl("https://example.com/api/", "hello") // => "https://example.com/api/hello"
 */
export function joinUrl(baseOrig: string, url: string): string {
  const base = baseOrig.replace(/(\/)?(\?|#|$)/, "/$2");

  return new URL(url, base).toString();
}
