import fs from "fs";
import path from "path";
import os from "os";
import { FileWatcher } from "@/eventBus/infra/fileWatcher";
import { sleep } from "@/util/async";

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
        await sleep(10);

        expect(callback.mock.calls).toEqual([["test"]]);
      });

      describe("when file is written multiple times", () => {
        it("should call callback multiple times", async () => {
          const callback = jest.fn();

          await watcher.open(callback);

          await fs.promises.appendFile(file, "test1");
          await sleep(10);
          await fs.promises.appendFile(file, "test2");
          await sleep(10);

          expect(callback.mock.calls).toEqual([["test1"], ["test2"]]);
        });
      });
    });

    describe("when file is written before open", () => {
      beforeEach(async () => {
        await fs.promises.appendFile(file, "existing text");
        await sleep(10);
      });

      it("should call callback without existing text", async () => {
        const callback = jest.fn();

        await watcher.open(callback);

        await fs.promises.appendFile(file, "test1");
        await sleep(10);

        expect(callback.mock.calls).toEqual([["test1"]]);
      });
    });
  });
});
