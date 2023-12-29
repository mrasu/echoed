import fs from "fs";
import path from "path";

export async function appendFileLine(filepath: string, text: string) {
  await new Promise((resolve, reject) => {
    fs.appendFile(filepath, text + "\n", (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(undefined);
    });
  });
}

export function statSync(file: string): fs.Stats | undefined {
  try {
    return fs.statSync(file);
  } catch (e: any) {
    if ("code" in e && e.code === "ENOENT") {
      return undefined;
    }
    throw e;
  }
}

export async function createEmptyFile(file: string) {
  await fs.promises.mkdir(path.dirname(file), {
    recursive: true,
  });
  await fs.promises.writeFile(file, "");
}

export function omitDirPath(file: string, dir: string): string {
  return file.replace(dir, "");
}
