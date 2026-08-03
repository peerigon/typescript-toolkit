import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineLimitedFetch, parseRetryAfter } from "./rate-limit.ts";

describe("parseRetryAfter()", () => {
  it("parses delay-seconds", () => {
    expect(parseRetryAfter("5", 0)).toBe(5000);
    expect(parseRetryAfter("0", 0)).toBe(0);
  });

  it("parses HTTP-date", () => {
    const now = Date.parse("Wed, 21 Oct 2015 07:28:00 GMT");
    expect(parseRetryAfter("Wed, 21 Oct 2015 07:28:05 GMT", now)).toBe(5000);
  });

  it("returns undefined for missing or invalid values", () => {
    expect(parseRetryAfter(null)).toBeUndefined();
    expect(parseRetryAfter("")).toBeUndefined();
    expect(parseRetryAfter("nope")).toBeUndefined();
  });
});

describe("defineLimitedFetch()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("paces requests through the rate limiter", async () => {
    const calls: Array<number> = [];
    const fetchImpl = vi.fn(async () => {
      calls.push(Date.now());
      return new Response("ok");
    });

    const limited = defineLimitedFetch({
      max: 1,
      interval: 1000,
      fetch: fetchImpl,
    });

    const first = limited("https://example.com/a");
    const second = limited("https://example.com/b");

    await vi.advanceTimersByTimeAsync(0);
    expect(calls).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(1000);
    await Promise.all([first, second]);
    expect(calls).toHaveLength(2);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("retries 429 using Retry-After seconds", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("slow down", {
          status: 429,
          headers: { "Retry-After": "1" },
        }),
      )
      .mockResolvedValueOnce(new Response("ok"));

    const limited = defineLimitedFetch({
      max: 10,
      interval: 1000,
      fetch: fetchImpl,
    });

    const pending = limited("https://example.com/x");
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    await expect(pending).resolves.toMatchObject({ status: 200 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("retries 503 when Retry-After is present", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("unavailable", {
          status: 503,
          headers: { "Retry-After": "2" },
        }),
      )
      .mockResolvedValueOnce(new Response("ok"));

    const limited = defineLimitedFetch({
      max: 10,
      interval: 1000,
      fetch: fetchImpl,
    });

    const pending = limited("https://example.com/x");
    await vi.advanceTimersByTimeAsync(2000);
    await expect(pending).resolves.toMatchObject({ status: 200 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry 503 without Retry-After", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("unavailable", { status: 503 }),
    );

    const limited = defineLimitedFetch({
      max: 10,
      interval: 1000,
      fetch: fetchImpl,
    });

    const response = await limited("https://example.com/x");
    expect(response.status).toBe(503);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("stops retrying after maxRetries", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response("slow down", {
          status: 429,
          headers: { "Retry-After": "1" },
        }),
    );

    const limited = defineLimitedFetch({
      max: 10,
      interval: 1000,
      maxRetries: 2,
      fetch: fetchImpl,
    });

    const pending = limited("https://example.com/x");

    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(1000);

    const response = await pending;
    expect(response.status).toBe(429);
    // initial + 2 retries
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("aborts while waiting for Retry-After", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response("slow down", {
          status: 429,
          headers: { "Retry-After": "10" },
        }),
    );
    const controller = new AbortController();

    const limited = defineLimitedFetch({
      max: 10,
      interval: 1000,
      fetch: fetchImpl,
    });

    const pending = limited("https://example.com/x", {
      signal: controller.signal,
    });

    await vi.advanceTimersByTimeAsync(0);
    controller.abort(new Error("stopped"));

    await expect(pending).rejects.toThrow("stopped");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("aborts while queued behind the rate limiter", async () => {
    const fetchImpl = vi.fn(async () => new Response("ok"));
    const controller = new AbortController();

    const limited = defineLimitedFetch({
      max: 1,
      interval: 1000,
      fetch: fetchImpl,
    });

    const first = limited("https://example.com/a");
    const second = limited("https://example.com/b", {
      signal: controller.signal,
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    controller.abort(new Error("stopped"));
    await expect(second).rejects.toThrow("stopped");
    await expect(first).resolves.toMatchObject({ status: 200 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
