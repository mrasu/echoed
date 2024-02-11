import { LocalDirectory } from "@/fs/localDirectory";
import { LocalFile } from "@/fs/localFile";
import fs from "fs";
import os from "os";
import path from "path";

describe("LocalDirectory", () => {
  let tmpdirPath: string;
  let tmpDir: LocalDirectory;

  beforeEach(() => {
    tmpdirPath = fs.mkdtempSync(path.join(os.tmpdir(), "echoed-test-"));
    tmpDir = new LocalDirectory(tmpdirPath);
  });

  afterEach(async () => {
    await fs.promises.rm(tmpdirPath, { recursive: true, force: true });
  });

  describe("newDir", () => {
    it("should create new Instance with joined path", () => {
      const newDir = tmpDir.newDir("foo");

      expect(newDir.path).toEqual(path.join(tmpdirPath, "foo"));
    });
  });

  describe("newFile", () => {
    it("should create new LocalFile's Instance with joined path", () => {
      const newFile = tmpDir.newFile("foo");

      expect(newFile.path).toEqual(path.join(tmpdirPath, "foo"));
    });
  });

  describe("resolve", () => {
    it("should return new Instance with fullpath", () => {
      const dir = new LocalDirectory("foo/bar").resolve();
      expect(dir).toMatch(/\/foo\/bar$/);
    });
  });

  describe("mkdirSync", () => {
    it("should return new Instance with fullpath", async () => {
      const dir = new LocalDirectory(path.join(tmpdirPath, "foo/bar"));
      dir.mkdirSync();

      const childDirs = await fs.promises.readdir(tmpdirPath);
      expect(childDirs).toEqual(["foo"]);

      const nestChildDirs = await fs.promises.readdir(
        path.join(tmpdirPath, "foo"),
      );
      expect(nestChildDirs).toEqual(["bar"]);
    });
  });

  describe("readdir", () => {
    it("should return files in directory", async () => {
      await fs.promises.writeFile(path.join(tmpdirPath, "foo"), "test");
      await fs.promises.writeFile(path.join(tmpdirPath, "bar"), "test");

      const dir = new LocalDirectory(tmpdirPath);

      const dirs = await dir.readdir();
      expect(dirs).toStrictEqual([
        new LocalFile(path.join(tmpdirPath, "bar")),
        new LocalFile(path.join(tmpdirPath, "foo")),
      ]);
    });
  });

  describe("rm", () => {
    it("should remove files recursively in directory", async () => {
      await fs.promises.mkdir(
        path.join(tmpdirPath, "nest1/nest2/nest3/nest4"),
        { recursive: true },
      );

      const dir = new LocalDirectory(path.join(tmpdirPath, "nest1/nest2"));
      await dir.rm();

      const exists1 = fs.existsSync(path.join(tmpdirPath, "nest1"));
      expect(exists1).toBe(true);
      const exists2 = fs.existsSync(path.join(tmpdirPath, "nest1", "nest2"));
      expect(exists2).toBe(false);
    });
  });
});
