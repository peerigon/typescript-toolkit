import { describe, expect, it, vi } from "vitest";
import { once } from "./once.ts";

describe("once()", () => {
  it("runs fn once and returns the cached value on subsequent calls", async () => {
    const fn = vi.fn(async () => "value");
    const run = once(fn);

    await expect(run()).resolves.toBe("value");
    await expect(run()).resolves.toBe("value");

    expect(fn).toHaveBeenCalledOnce();
  });

  it("shares the same in-flight promise between concurrent callers", async () => {
    let resolveFn!: (value: string) => void;
    const fn = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveFn = resolve;
        }),
    );
    const run = once(fn);

    const first = run();
    const second = run();

    expect(fn).toHaveBeenCalledOnce();

    resolveFn("shared");
    await expect(first).resolves.toBe("shared");
    await expect(second).resolves.toBe("shared");
  });

  it("retries after rejection and does not cache failures", async () => {
    const givenError = new Error("failed once");
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(givenError)
      .mockResolvedValueOnce("recovered");
    const run = once(fn);

    await expect(run()).rejects.toThrow(givenError);
    await expect(run()).resolves.toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("rethrows non-Error rejections and allows a retry", async () => {
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce("not an error")
      .mockResolvedValueOnce("recovered");
    const run = once(fn);

    await expect(run()).rejects.toBe("not an error");
    await expect(run()).resolves.toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("resolves the passive promise when another caller triggers success", async () => {
    const run = once(async () => "passive");

    const passive = run.promise;
    await expect(run()).resolves.toBe("passive");
    await expect(passive).resolves.toBe("passive");
  });
});
