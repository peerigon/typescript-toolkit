import { describe, expect, it } from "vitest";
import { mutex } from "./mutex.ts";

describe("mutex()", () => {
  it("serializes concurrent tasks", async () => {
    const lock = mutex();
    const order: Array<number> = [];

    let resolveFirst!: () => void;
    const firstStarted = new Promise<void>((resolve) => {
      resolveFirst = resolve;
    });

    const first = lock(async () => {
      order.push(1);
      await firstStarted;
      order.push(2);
      return "first";
    });

    await Promise.resolve();
    expect(order).toEqual([1]);

    const second = lock(async () => {
      order.push(3);
      return "second";
    });

    resolveFirst();
    await expect(first).resolves.toBe("first");
    await expect(second).resolves.toBe("second");
    expect(order).toEqual([1, 2, 3]);
  });
});
