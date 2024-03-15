import { test } from "@/fixtures/test";
import { expect } from "@playwright/test";

test.describe("zBulk test", () => {
  test.skip("1", async () => {
    expect(1).toBe(2);
  });
  test("2", async () => {
    expect(1).toBe(1);
  });
  test("3", async () => {
    expect(1).toBe(1);
  });
  test("4", async () => {
    expect(1).toBe(1);
  });
  test("5", async () => {
    expect(1).toBe(1);
  });
  test("6", async () => {
    expect(1).toBe(1);
  });
  test("7", async () => {
    expect(1).toBe(1);
  });
  test("8", async () => {
    expect(1).toBe(1);
  });
  test("9", async () => {
    expect(1).toBe(1);
  });
  test("10", async () => {
    expect(1).toBe(1);
  });
});
