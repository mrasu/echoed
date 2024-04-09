import {
  getServerPortFromCypressEnv,
  getTmpDirFromCypressEnv,
  setServerPortToCypressEnv,
  setTmpDirToCypressEnv,
} from "@/integration/cypress/internal/util/env";
import { DummyCyObj } from "@/testUtil/cypress/dummyCyObj";
import { buildCypressPluginConfigOptions } from "@/testUtil/cypress/pluginConfigOptions";

describe("setServerPortToCypressEnv", () => {
  it("should save the port number", () => {
    const options = buildCypressPluginConfigOptions({
      env: { a: "b" },
    });
    setServerPortToCypressEnv(options, 1234);

    expect(options.env).toEqual({ a: "b", __ECHOED_SERVER_PORT__: "1234" });
  });
});

describe("setServerPortToCypressEnv", () => {
  it("should return port number", () => {
    const obj = new DummyCyObj({
      envs: { __ECHOED_SERVER_PORT__: "1234" },
    });
    const port = getServerPortFromCypressEnv(obj);

    expect(port).toBe(1234);
  });

  describe("when the port is not set", () => {
    it("should return undefined", () => {
      const obj = new DummyCyObj();
      const port = getServerPortFromCypressEnv(obj);

      expect(port).toBe(undefined);
    });
  });

  describe("when the port is not number", () => {
    it("should return undefined", () => {
      const obj = new DummyCyObj({
        envs: { __ECHOED_SERVER_PORT__: "aaa" },
      });
      const port = getServerPortFromCypressEnv(obj);

      expect(port).toBe(undefined);
    });
  });
});

describe("setTmpDirToCypressEnv", () => {
  it("should save the tmp dir", () => {
    const options = buildCypressPluginConfigOptions({
      env: { a: "b" },
    });
    setTmpDirToCypressEnv(options, "/tmp");

    expect(options.env).toEqual({ a: "b", __ECHOED_TMP_DIR__: "/tmp" });
  });
});

describe("getTmpDirFromCypressEnv", () => {
  describe("when the tmp dir is set", () => {
    it("should return the tmp dir", () => {
      const obj = new DummyCyObj({
        envs: { __ECHOED_TMP_DIR__: "/tmp" },
      });
      const tmpDir = getTmpDirFromCypressEnv(obj);

      expect(tmpDir).toBe("/tmp");
    });
  });

  describe("when the tmp dir is not set", () => {
    it("should return undefined", () => {
      const obj = new DummyCyObj();
      const tmpDir = getTmpDirFromCypressEnv(obj);

      expect(tmpDir).toBe(undefined);
    });
  });
});
