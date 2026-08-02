import { describe, expect, it, vi } from "vitest";
import { exactlyOnce } from "./exactlyOnce.ts";

describe("exactlyOnce()", () => {
  it("runs fn on the first call with the provided arguments", async () => {
    const fn = vi.fn(async (value: number) => value * 2);
    const run = exactlyOnce(fn);

    await expect(run(21)).resolves.toBe(42);
    expect(fn).toHaveBeenCalledExactlyOnceWith(21);
  });

  it("throws synchronously on a second call", () => {
    const fn = vi.fn(async () => "done");
    const run = exactlyOnce(fn);

    void run();
    expect(() => run()).toThrow(new Error("Function was already invoked"));
  });

  it("throws synchronously when a concurrent second call starts while in flight", async () => {
    let resolveFn!: (value: string) => void;
    const fn = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveFn = resolve;
        }),
    );
    const run = exactlyOnce(fn);

    const first = run();
    expect(() => run()).toThrow(new Error("Function was already invoked"));

    resolveFn("once");
    await expect(first).resolves.toBe("once");
    expect(fn).toHaveBeenCalledOnce();
  });

  it("rejects the passive promise on failure and does not allow retry", async () => {
    const givenError = new Error("terminal");
    const fn = vi.fn(async () => {
      throw givenError;
    });
    const run = exactlyOnce(fn);

    const passive = run.promise;
    await expect(run()).rejects.toThrow(givenError);
    await expect(passive).rejects.toThrow(givenError);
    expect(() => run()).toThrow(new Error("Function was already invoked"));
    expect(fn).toHaveBeenCalledOnce();
  });

  it("resolves the passive promise when another caller triggers success", async () => {
    const run = exactlyOnce(async () => "ready");

    const passive = run.promise;
    await expect(run()).resolves.toBe("ready");
    await expect(passive).resolves.toBe("ready");
  });
});
