import { State } from "@/server/parameter/stateParameter";

export class StateStore {
  states = new Map<string, State>();

  constructor() {}

  set(key: string, state: State): void {
    this.states.set(key, state);
  }

  delete(key: string): void {
    this.states.delete(key);
  }

  isEmpty(): boolean {
    return this.states.size === 0;
  }
}
