import { MemoryBus } from "@/eventBus/infra/memoryBus";
import { MAX_WAIT_MS } from "@/testUtil/async";

describe("MemoryBus", () => {
  describe("on", () => {
    let bus: MemoryBus;
    beforeEach(() => {
      bus = new MemoryBus();
    });

    it("should call callback when event is emitted", async () => {
      const callback = jest.fn();

      bus.on("testEvent", callback);
      await bus.emit("testEvent", { test: "testData" });

      expect(callback.mock.calls).toEqual([[{ test: "testData" }]]);
    });

    describe("when event is emitted before open", () => {
      it("should not call callback", async () => {
        const callback = jest.fn();

        await bus.emit("testEvent", { test: "testData" });

        bus.on("testEvent", callback);

        expect(callback.mock.calls.length).toBe(0);
      });
    });

    describe("when event is emitted multiple times", () => {
      it("should call callback multiple times", async () => {
        const callback = jest.fn();

        bus.on("testEvent", callback);
        await bus.emit("testEvent", { test: "testData1" });
        await bus.emit("testEvent", { test: "testData2" });

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

        bus.on("testEvent", callback1);
        bus.on("testEvent", callback2);
        await bus.emit("testEvent", { test: "testData" });

        expect(callback1.mock.calls).toEqual([[{ test: "testData" }]]);
        expect(callback2.mock.calls).toEqual([[{ test: "testData" }]]);
      });
    });
  });

  describe("onOnce", () => {
    let bus: MemoryBus;
    beforeEach(() => {
      bus = new MemoryBus();
    });

    it("should return event when event is emitted", async () => {
      const callback = async (data: unknown): Promise<unknown> => {
        return Promise.resolve(data);
      };

      const result = bus.onOnce("testEvent", MAX_WAIT_MS, callback);
      await bus.emit("testEvent", { test: "testData" });
      const data = await result;

      expect(data).toEqual({ test: "testData" });
    });
  });

  describe("off", () => {
    let bus: MemoryBus;
    beforeEach(() => {
      bus = new MemoryBus();
    });

    it("should stop listening event", async () => {
      const callback = jest.fn();

      bus.on("testEvent", callback);
      await bus.emit("testEvent", { test: "testData1" });
      bus.off("testEvent", callback);
      await bus.emit("testEvent", { test: "testData2" });

      expect(callback.mock.calls).toEqual([[{ test: "testData1" }]]);
    });
  });

  describe("emit", () => {
    class JSONIrreversible {
      public toJSON(): unknown {
        return {
          irreversible: true,
        };
      }
    }

    it("should parse data to JSON after stringify", async () => {
      const bus = new MemoryBus();

      const callback = jest.fn();
      bus.on("testEvent", callback);
      await bus.emit("testEvent", new JSONIrreversible());

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0]).toEqual([
        {
          irreversible: true,
        },
      ]);
    });
  });
});
