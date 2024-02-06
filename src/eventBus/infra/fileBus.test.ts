import { FileBus } from "@/eventBus/infra/fileBus";
import { MAX_WAIT_MS, waitUntilCalled } from "@/testUtil/async";
import { sleep } from "@/util/async";
import fs from "fs";
import os from "os";
import path from "path";

describe("FileBus", () => {
  let file: string;
  beforeEach(() => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "echoed-"));
    file = path.join(tmpdir, "eventBus.jsonl");
  });

  afterEach(async () => {
    await fs.promises.unlink(file);
  });

  describe("on", () => {
    let bus: FileBus;
    beforeEach(() => {
      bus = new FileBus(file);
    });

    afterEach(() => {
      bus.close();
    });

    it("should call callback when event is emitted", async () => {
      const callback = jest.fn();

      await bus.open();
      bus.on("testEvent", callback);
      await bus.emit("testEvent", { test: "testData" });
      await waitUntilCalled(callback);

      expect(callback.mock.calls).toEqual([[{ test: "testData" }]]);
    });

    describe("when event is emitted before open", () => {
      it("should not call callback", async () => {
        const callback = jest.fn();

        await bus.emit("testEvent", { test: "testData" });
        await bus.open();

        bus.on("testEvent", callback);
        await waitUntilCalled(callback);

        expect(callback.mock.calls.length).toBe(0);
      });
    });

    describe("when event is emitted multiple times", () => {
      it("should call callback multiple times", async () => {
        const callback = jest.fn();

        await bus.open();
        bus.on("testEvent", callback);
        await bus.emit("testEvent", { test: "testData1" });
        await bus.emit("testEvent", { test: "testData2" });
        await waitUntilCalled(callback, 2);

        expect(callback.mock.calls).toEqual([
          [{ test: "testData1" }],
          [{ test: "testData2" }],
        ]);
      });
    });

    describe("when on is called multiple times", () => {
      it("should call each callback", async () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        await bus.open();
        bus.on("testEvent", callback1);
        bus.on("testEvent", callback2);
        await bus.emit("testEvent", { test: "testData" });
        await waitUntilCalled(callback1);
        await waitUntilCalled(callback2);

        expect(callback1.mock.calls).toEqual([[{ test: "testData" }]]);
        expect(callback2.mock.calls).toEqual([[{ test: "testData" }]]);
      });
    });
  });

  describe("onOnce", () => {
    let bus: FileBus;
    beforeEach(() => {
      bus = new FileBus(file);
    });

    afterEach(() => {
      bus.close();
    });

    it("should return event when event is emitted", async () => {
      const callback = async (data: unknown): Promise<unknown> => {
        return Promise.resolve(data);
      };

      await bus.open();
      const result = bus.onOnce("testEvent", MAX_WAIT_MS, callback);
      await bus.emit("testEvent", { test: "testData" });
      const data = await result;

      expect(data).toEqual({ test: "testData" });
    });
  });

  describe("off", () => {
    let bus: FileBus;
    beforeEach(() => {
      bus = new FileBus(file);
    });

    afterEach(() => {
      bus.close();
    });

    it("should stop listening event", async () => {
      const callback = jest.fn();

      await bus.open();
      bus.on("testEvent", callback);
      await bus.emit("testEvent", { test: "testData1" });
      await waitUntilCalled(callback);
      bus.off("testEvent", callback);
      await bus.emit("testEvent", { test: "testData2" });
      await sleep(10);

      expect(callback.mock.calls).toEqual([[{ test: "testData1" }]]);
    });
  });

  describe("emit", () => {
    const readEvents = async (file: string): Promise<unknown[]> => {
      const txt = await fs.promises.readFile(file, "utf-8");
      const events = txt
        .split("\n")
        .filter((a) => a)
        .map((line) => JSON.parse(line) as unknown);
      return events;
    };

    it("should write event to file", async () => {
      const bus = new FileBus(file);
      await bus.emit("testEvent", { test: "testData" });

      const events = await readEvents(file);
      expect(events).toEqual([
        {
          event: "testEvent",
          data: { test: "testData" },
        },
      ]);
    });

    describe("when submitting multiple times", () => {
      it("should write events to file", async () => {
        const bus = new FileBus(file);
        await bus.emit("testEvent1", { test: "testData1" });
        await bus.emit("testEvent2", { test: "testData2" });

        const events = await readEvents(file);
        expect(events).toEqual([
          {
            event: "testEvent1",
            data: { test: "testData1" },
          },
          {
            event: "testEvent2",
            data: { test: "testData2" },
          },
        ]);
      });
    });
  });
});
