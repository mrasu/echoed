import { IFileWatcher } from "@/fs/IFileWatcher";
import { LocalDirectory } from "@/fs/localDirectory";
import { LocalFile } from "@/fs/localFile";
import { waitUntilCalled } from "@/testUtil/async";
import fs from "fs";
import os from "os";
import path from "path";

describe("LocalFile", () => {
  let tmpdirPath: string;
  let tmpFilePath: string;
  let tmpFile: LocalFile;

  beforeEach(() => {
    tmpdirPath = fs.mkdtempSync(path.join(os.tmpdir(), "echoed-test-"));
    tmpFilePath = path.join(tmpdirPath, "foo.txt");
    tmpFile = new LocalFile(tmpFilePath);
  });

  afterEach(async () => {
    await fs.promises.rm(tmpdirPath, { recursive: true, force: true });
  });

  describe("toDir", () => {
    it("should create new LocalDirectory Instance with the same path", () => {
      const newDir = tmpFile.toDir();

      expect(newDir).toStrictEqual(new LocalDirectory(tmpFilePath));
    });
  });

  describe("read", () => {
    it("should return file's text", async () => {
      await fs.promises.writeFile(tmpFilePath, "test text");
      const text = await tmpFile.read();

      expect(text).toEqual("test text");
    });
  });

  describe("readSync", () => {
    it("should return file's text", async () => {
      await fs.promises.writeFile(tmpFilePath, "test text");
      const text = tmpFile.readSync();

      expect(text).toEqual("test text");
    });
  });

  describe("existsSync", () => {
    describe("when file exists", () => {
      beforeEach(async () => {
        await fs.promises.writeFile(tmpFilePath, "test text");
      });

      it("should return true", () => {
        expect(tmpFile.existsSync()).toBe(true);
      });
    });

    describe("when doesn't file exists", () => {
      it("should return true", () => {
        expect(tmpFile.existsSync()).toBe(false);
      });
    });
  });

  describe("statSync", () => {
    describe("when file exists", () => {
      const text = "test text";
      beforeEach(async () => {
        await fs.promises.writeFile(tmpFilePath, text);
      });

      it("should return stat", () => {
        expect(tmpFile.statSync()?.size).toBe(text.length);
      });
    });

    describe("when doesn't file exists", () => {
      it("should return undefined", () => {
        expect(tmpFile.statSync()).toBe(undefined);
      });
    });
  });

  describe("startWatching", () => {
    let watcher: IFileWatcher | undefined;
    afterEach(() => {
      watcher?.close();
    });

    it("should return started watcher", async () => {
      const callback = jest.fn();
      watcher = await tmpFile.startWatching(callback);

      await fs.promises.writeFile(tmpFile.path, "test text");

      await waitUntilCalled(callback);
      expect(callback.mock.calls).toEqual([["test text"]]);
    });
  });

  describe("ensureDir", () => {
    it("should create directory recursively", async () => {
      const file = new LocalFile(path.join(tmpdirPath, "foo/bar/baz.txt"));
      await file.ensureDir();

      const created = fs.existsSync(path.join(tmpdirPath, "foo/bar"));
      expect(created).toBe(true);
    });
  });

  describe("createEmptyWithDir", () => {
    it("should create file", async () => {
      const file = new LocalFile(path.join(tmpdirPath, "foo/bar/baz.txt"));
      await file.createEmptyWithDir();

      const created = fs.existsSync(path.join(tmpdirPath, "foo/bar/baz.txt"));
      expect(created).toBe(true);
    });
  });

  describe("write", () => {
    it("should create file", async () => {
      await tmpFile.write("test text");

      const text = await tmpFile.read();
      expect(text).toBe("test text");
    });
  });

  describe("append", () => {
    it("should append text to file", async () => {
      await tmpFile.append("hello");
      await tmpFile.append("world");

      const text = await tmpFile.read();
      expect(text).toBe("helloworld");
    });
  });

  describe("appendLine", () => {
    it("should append text to file", async () => {
      await tmpFile.appendLine("hello");
      await tmpFile.appendLine("world");

      const text = await tmpFile.read();
      expect(text).toBe("hello\nworld\n");
    });
  });

  describe("unlink", () => {
    it("should remove file", async () => {
      await tmpFile.createEmptyWithDir();
      expect(fs.existsSync(path.join(tmpFilePath))).toBe(true);

      await tmpFile.unlink();
      expect(fs.existsSync(path.join(tmpFilePath))).toBe(false);
    });
  });
});
