import { FileWatcher } from "@/eventBus/infra/fileWatcher";
import { MAX_WAIT_MS, waitUntilCalled } from "@/testUtil/async";
import { sleep } from "@/util/async";
import fs from "fs";
import os from "os";
import path from "path";

describe("FileWatcher", () => {
  let file: string;
  let watcher: FileWatcher;
  beforeEach(() => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "echoed-"));
    file = path.join(tmpdir, "eventBus.jsonl");

    watcher = new FileWatcher(file);
  });

  afterEach(async () => {
    watcher.close();
    await fs.promises.unlink(file);
  });

  describe("open", () => {
    describe("when file is empty", () => {
      it("should call callback", async () => {
        const callback = jest.fn();

        await watcher.open(callback);

        await fs.promises.appendFile(file, "test");
        await waitUntilCalled(callback);

        expect(callback.mock.calls).toEqual([["test"]]);
      });

      describe("when file is written multiple times", () => {
        it("should call callback multiple times", async () => {
          const callback = jest.fn();

          await watcher.open(callback);

          await fs.promises.appendFile(file, "test1");
          await waitUntilCalled(callback);
          await fs.promises.appendFile(file, "test2");
          await waitUntilCalled(callback, 2);

          expect(callback.mock.calls).toEqual([["test1"], ["test2"]]);
        });
      });
    });

    describe("when file is written before open", () => {
      beforeEach(async () => {
        await fs.promises.appendFile(file, "existing text");
        await sleep(MAX_WAIT_MS);
      });

      it("should call callback without existing text", async () => {
        const callback = jest.fn();

        await watcher.open(callback);

        await fs.promises.appendFile(file, "test1");
        await waitUntilCalled(callback);

        expect(callback.mock.calls).toEqual([["test1"]]);
      });
    });
  });
});
