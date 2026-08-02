import { describe, expect, it, vi } from "vitest";
import { once } from "./result.ts";

describe("once() with result", () => {
  it("shares the same in-flight promise and exposes a pending snapshot", async () => {
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
    expect(run.result?.isPending).toBe(true);

    resolveFn("shared");
    await expect(first).resolves.toBe("shared");
    await expect(second).resolves.toBe("shared");
    expect(run.result?.isSuccess).toBe(true);
    expect(run.result?.data).toBe("shared");
  });

  it("retries after rejection and updates the result snapshot", async () => {
    const givenError = new Error("failed once");
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(givenError)
      .mockResolvedValueOnce("recovered");
    const run = once(fn);

    await expect(run()).rejects.toThrow(givenError);
    expect(run.result?.isError).toBe(true);
    expect(run.result?.error).toBe(givenError);

    await expect(run()).resolves.toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(run.result?.isSuccess).toBe(true);
    expect(run.result?.data).toBe("recovered");
  });

  it("rethrows non-Error rejections without storing an error snapshot", async () => {
    const fn = vi.fn(
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      () => Promise.reject("not an error"),
    );
    const run = once(fn);

    await expect(run()).rejects.toBe("not an error");
    expect(run.result).toBeUndefined();
  });

  it("transitions result from undefined to pending to success", async () => {
    let resolveFn!: (value: number) => void;
    const run = once(
      () =>
        new Promise<number>((resolve) => {
          resolveFn = resolve;
        }),
    );

    expect(run.result).toBeUndefined();

    const pending = run();
    expect(run.result?.isPending).toBe(true);

    resolveFn(42);
    await pending;
    expect(run.result?.isSuccess).toBe(true);
    expect(run.result?.data).toBe(42);
  });

  it("resolves the passive promise when another caller triggers success", async () => {
    const run = once(async () => "passive");

    const passive = run.promise;
    await expect(run()).resolves.toBe("passive");
    await expect(passive).resolves.toBe("passive");
  });
});
