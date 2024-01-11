import fs from "fs";
import path from "path";
import os from "os";
import { FileBus } from "@/eventBus/infra/fileBus";
import { sleep } from "@/util/async";

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
      await sleep(10);

      expect(callback.mock.calls).toEqual([[{ test: "testData" }]]);
    });

    describe("when event is emitted before open", () => {
      it("should not call callback", async () => {
        const callback = jest.fn();

        await bus.emit("testEvent", { test: "testData" });
        await bus.open();

        bus.on("testEvent", callback);
        await sleep(10);

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
        await sleep(10);

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
        await sleep(10);

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
      const callback = (data: unknown) => {
        return data;
      };

      await bus.open();
      const result = bus.onOnce("testEvent", 10, callback);
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
      await sleep(10);
      bus.off("testEvent", callback);
      await bus.emit("testEvent", { test: "testData2" });
      await sleep(10);

      expect(callback.mock.calls).toEqual([[{ test: "testData1" }]]);
    });
  });

  describe("emit", () => {
    const readEvents = async (file: string) => {
      const txt = await fs.promises.readFile(file, "utf-8");
      const events = txt
        .split("\n")
        .filter((a) => a)
        .map((line) => JSON.parse(line));
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
