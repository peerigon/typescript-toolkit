import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sleep } from "./sleep.ts";

describe("sleep()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves after the given delay", async () => {
    const pending = sleep(1000);
    let settled = false;
    void pending.then(() => {
      settled = true;
    });

    await vi.advanceTimersByTimeAsync(999);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(settled).toBe(true);
  });

  it("rejects immediately when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort(new Error("stopped"));

    await expect(sleep(1000, controller.signal)).rejects.toThrow("stopped");
  });

  it("rejects when the signal aborts while waiting", async () => {
    const controller = new AbortController();
    const pending = sleep(10_000, controller.signal);

    await vi.advanceTimersByTimeAsync(0);
    controller.abort(new Error("stopped"));

    await expect(pending).rejects.toThrow("stopped");
  });
});
