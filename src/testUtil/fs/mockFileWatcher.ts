import { IFileWatcher } from "@/fs/IFileWatcher";

export class MockFileWatcher implements IFileWatcher {
  private callback: ((_: string) => Promise<void>) | undefined;
  foundTexts: string[] = [];

  private status: "open" | "closed" = "closed";

  open(callback: (_: string) => Promise<void>): Promise<void> {
    this.status = "open";

    this.callback = callback;
    return Promise.resolve();
  }

  close(): void {
    this.status = "closed";
  }

  async runCallback(text: string): Promise<void> {
    if (this.status === "closed") {
      // do nothing as this watcher is not watching
      return;
    }

    if (this.callback) {
      await this.callback(text);
    }

    this.foundTexts.push(text);
  }
}
