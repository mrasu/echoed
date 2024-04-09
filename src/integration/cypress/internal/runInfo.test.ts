import { RunInfo } from "@/integration/cypress/internal/runInfo";
import { buildCypressSpec } from "@/testUtil/cypress/cypressSpec";
import { buildDummyFileSpace } from "@/testUtil/fs/fileSpace";

describe("RunInfo", () => {
  describe("reset", () => {
    it("should set currentSpec undefined", () => {
      const fileSpace = buildDummyFileSpace();
      const runInfo = new RunInfo(fileSpace);

      runInfo.currentSpec = buildCypressSpec();
      expect(runInfo.currentSpec).not.toBe(undefined);

      runInfo.reset();

      expect(runInfo.currentSpec).toBe(undefined);
    });
  });

  describe("setCurrentSpec", () => {
    it("should set currentSpec", () => {
      const fileSpace = buildDummyFileSpace();
      const runInfo = new RunInfo(fileSpace);

      const spec = buildCypressSpec();
      const specHook = runInfo.setCurrentSpec(spec);

      expect(runInfo.currentSpec).toBe(spec);
      expect(specHook).toBeDefined();
    });
  });
});
