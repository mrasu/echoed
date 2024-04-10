import { StateStore } from "@/server/store/stateStore";

describe("StateStore", () => {
  describe("set", () => {
    it("should set state", () => {
      const store = new StateStore();
      store.set("name1", "start");
      store.set("name2", "start");

      expect(store.states).toEqual(
        new Map([
          ["name1", "start"],
          ["name2", "start"],
        ]),
      );
    });
  });

  describe("delete", () => {
    it("should delete state", () => {
      const store = new StateStore();
      store.set("name1", "start");
      store.delete("name1");

      expect(store.states).toEqual(new Map());
    });
  });

  describe("isEmpty", () => {
    describe("when no state exists", () => {
      it("should return true", () => {
        const store = new StateStore();
        expect(store.isEmpty()).toBe(true);
      });
    });

    describe("when state exists", () => {
      it("should return false", () => {
        const store = new StateStore();
        store.set("name1", "start");

        expect(store.isEmpty()).toBe(false);
      });
    });
  });
});
