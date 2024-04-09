export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + "...";
}

export function toOnlyCharacters(str: string): string {
  return str.replace(/[^a-zA-Z1-9]/g, "");
}
