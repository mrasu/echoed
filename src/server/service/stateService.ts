import { State } from "@/server/parameter/stateParameter";
import { StateStore } from "@/server/store/stateStore";
import { neverVisit } from "@/util/never";

export class StateService {
  constructor(private stateStore: StateStore) {}

  stateChanged(name: string, state: State): void {
    switch (state) {
      case "start":
        this.stateStore.set(name, "start");
        break;
      case "end":
        this.stateStore.delete(name);
        break;
      default:
        neverVisit("unknown state", state);
    }
  }
}
