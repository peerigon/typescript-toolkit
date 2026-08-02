import { describe, expect, it, vi } from "vitest";
import { exactlyOnce } from "./result.ts";

describe("exactlyOnce() with result", () => {
  it("exposes a pending snapshot while the first call is in flight", async () => {
    let resolveFn!: (value: string) => void;
    const fn = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveFn = resolve;
        }),
    );
    const run = exactlyOnce(fn);

    expect(run.result).toBeUndefined();
    const first = run();
    expect(run.result?.isPending).toBe(true);
    expect(() => run()).toThrow(new Error("Function was already invoked"));

    resolveFn("once");
    await expect(first).resolves.toBe("once");
    expect(run.result?.isSuccess).toBe(true);
    expect(run.result?.data).toBe("once");
  });

  it("marks failures as terminal and rejects the passive promise", async () => {
    const givenError = new Error("terminal");
    const fn = vi.fn(async () => {
      throw givenError;
    });
    const run = exactlyOnce(fn);

    const passive = run.promise;
    await expect(run()).rejects.toThrow(givenError);
    await expect(passive).rejects.toThrow(givenError);
    expect(run.result?.isError).toBe(true);
    expect(run.result?.error).toBe(givenError);
    expect(() => run()).toThrow(new Error("Function was already invoked"));
    expect(fn).toHaveBeenCalledOnce();
  });

  it("stores an error snapshot for non-Error rejections", async () => {
    const fn = vi.fn(
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      () => Promise.reject("not an error"),
    );
    const run = exactlyOnce(fn);

    const passive = run.promise;
    await expect(run()).rejects.toBe("not an error");
    await expect(passive).rejects.toBe("not an error");
    expect(run.result?.isError).toBe(true);
    expect(run.result?.error?.message).toBe("Non-Error rejection");
    expect(run.result?.error?.cause).toBe("not an error");
    expect(() => run()).toThrow(new Error("Function was already invoked"));
    expect(fn).toHaveBeenCalledOnce();
  });

  it("resolves the passive promise when another caller triggers success", async () => {
    const run = exactlyOnce(async () => "ready");

    const passive = run.promise;
    await expect(run()).resolves.toBe("ready");
    await expect(passive).resolves.toBe("ready");
    expect(run.result?.isSuccess).toBe(true);
  });
});
