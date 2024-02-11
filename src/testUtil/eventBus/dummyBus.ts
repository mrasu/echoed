import { FileBus } from "@/eventBus/infra/fileBus";
import { MockFile } from "@/testUtil/fs/mockFile";
import { MockFileWatcher } from "@/testUtil/fs/mockFileWatcher";

type EventData<T> = {
  event: string;
  data: T;
};

export class DummyBus<T> extends FileBus {
  constructor() {
    const watcher = new MockFileWatcher();
    const file = MockFile.buildWithWatcher(watcher);
    super(file);
  }

  get mockWatcher(): MockFileWatcher {
    return this.watcher as MockFileWatcher;
  }

  emittedData(): EventData<T>[] {
    return this.mockWatcher.foundTexts.map((text) => {
      return JSON.parse(text) as EventData<T>;
    });
  }
}
