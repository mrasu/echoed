import { FileWatcher } from "@/fs/fileWatcher";
import { LocalFile } from "@/fs/localFile";
import { MAX_WAIT_MS, waitUntilCalled } from "@/testUtil/async";
import { sleep } from "@/util/async";
import fs from "fs";
import os from "os";
import path from "path";

describe("FileWatcher", () => {
  let tmpdirPath: string;
  let file: LocalFile;
  let watcher: FileWatcher;

  beforeEach(() => {
    tmpdirPath = fs.mkdtempSync(path.join(os.tmpdir(), "echoed-"));
    file = new LocalFile(path.join(tmpdirPath, "eventBus.jsonl"));

    watcher = new FileWatcher(file);
  });

  afterEach(async () => {
    watcher.close();
    await fs.promises.rm(tmpdirPath, { recursive: true, force: true });
  });

  describe("open", () => {
    describe("when file is empty", () => {
      it("should call callback", async () => {
        const callback = jest.fn();

        await watcher.open(callback);

        await file.append("test");
        await waitUntilCalled(callback);

        expect(callback.mock.calls).toEqual([["test"]]);
      });

      describe("when file is written multiple times", () => {
        it("should call callback multiple times", async () => {
          const callback = jest.fn();

          await watcher.open(callback);

          await file.append("test1");
          await waitUntilCalled(callback);
          await file.append("test2");
          await waitUntilCalled(callback, 2);

          expect(callback.mock.calls).toEqual([["test1"], ["test2"]]);
        });
      });
    });

    describe("when file is written before open", () => {
      beforeEach(async () => {
        await file.append("existing text");
        await sleep(MAX_WAIT_MS);
      });

      it("should call callback without existing text", async () => {
        const callback = jest.fn();

        await watcher.open(callback);

        await file.append("test1");
        await waitUntilCalled(callback);

        expect(callback.mock.calls).toEqual([["test1"]]);
      });
    });
  });
});
