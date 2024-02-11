export function omitDirPath(file: string, dir: string): string {
  return file.replace(dir, "");
}
