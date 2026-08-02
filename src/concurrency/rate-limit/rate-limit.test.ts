import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "./rate-limit.ts";

describe("rateLimit()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws on invalid options", () => {
    expect(() => rateLimit({ max: 0, interval: 1000 })).toThrow(TypeError);
    expect(() => rateLimit({ max: 1, interval: 0 })).toThrow(TypeError);
  });

  it("allows up to max tasks to start immediately", async () => {
    const limit = rateLimit({ max: 2, interval: 1000 });
    const started: Array<number> = [];

    const results = await Promise.all([
      limit(async () => {
        started.push(1);
        return "a";
      }),
      limit(async () => {
        started.push(2);
        return "b";
      }),
    ]);

    expect(started).toEqual([1, 2]);
    expect(results).toEqual(["a", "b"]);
  });

  it("delays the next start until the window has capacity", async () => {
    const limit = rateLimit({ max: 1, interval: 1000 });
    const started: Array<number> = [];

    const first = limit(async () => {
      started.push(Date.now());
      return "first";
    });
    const second = limit(async () => {
      started.push(Date.now());
      return "second";
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(started).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(999);
    expect(started).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(1);
    await expect(first).resolves.toBe("first");
    await expect(second).resolves.toBe("second");
    expect(started).toHaveLength(2);
    expect(started[1]! - started[0]!).toBeGreaterThanOrEqual(1000);
  });

  it("runs admitted tasks concurrently", async () => {
    const limit = rateLimit({ max: 2, interval: 1000 });
    let inFlight = 0;
    let peak = 0;

    const run = () =>
      limit(async () => {
        inFlight++;
        peak = Math.max(peak, inFlight);
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 50);
        });
        inFlight--;
      });

    const all = Promise.all([run(), run()]);
    await vi.advanceTimersByTimeAsync(50);
    await all;

    expect(peak).toBe(2);
  });

  it("rejects admission wait when the signal aborts", async () => {
    const limit = rateLimit({ max: 1, interval: 1000 });
    const controller = new AbortController();
    const started: Array<string> = [];

    const first = limit(async () => {
      started.push("first");
      return "first";
    });
    const second = limit(async () => {
      started.push("second");
      return "second";
    }, controller.signal);

    await vi.advanceTimersByTimeAsync(0);
    expect(started).toEqual(["first"]);

    controller.abort(new Error("stopped"));
    await expect(second).rejects.toThrow("stopped");
    await expect(first).resolves.toBe("first");
    expect(started).toEqual(["first"]);
  });

  it("does not consume a slot when admission is aborted", async () => {
    const limit = rateLimit({ max: 1, interval: 1000 });
    const controller = new AbortController();

    const first = limit(async () => "first");
    const aborted = limit(async () => "aborted", controller.signal);

    await vi.advanceTimersByTimeAsync(0);
    controller.abort(new Error("stopped"));
    await expect(aborted).rejects.toThrow("stopped");
    await expect(first).resolves.toBe("first");

    const third = limit(async () => {
      return Date.now();
    });

    // First slot still held until interval elapses; third must wait.
    await vi.advanceTimersByTimeAsync(999);
    let settled = false;
    void third.then(() => {
      settled = true;
    });
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(third).resolves.toBeTypeOf("number");
  });
});
