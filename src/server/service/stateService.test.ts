import { StateService } from "@/server/service/stateService";
import { StateStore } from "@/server/store/stateStore";

describe("StateService", () => {
  describe("stateChanged", () => {
    describe("when state is start", () => {
      it("should set state", () => {
        const stateStore = new StateStore();
        const service = new StateService(stateStore);

        service.stateChanged("name", "start");

        expect(stateStore.states.size).toEqual(1);
        expect(stateStore.states.get("name")).toEqual("start");
      });
    });

    describe("when state is end", () => {
      it("should remove state", () => {
        const stateStore = new StateStore();
        stateStore.set("name", "start");

        const service = new StateService(stateStore);

        service.stateChanged("name", "end");

        expect(stateStore.states.size).toEqual(0);
      });

      describe("when state is not registered", () => {
        it("should do nothing", () => {
          const stateStore = new StateStore();
          expect(stateStore.states.size).toEqual(0);

          const service = new StateService(stateStore);

          service.stateChanged("name", "end");

          expect(stateStore.states.size).toEqual(0);
        });
      });
    });
  });
});
