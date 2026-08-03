import {
  rateLimit,
  type RateLimitOptions,
} from "../../concurrency/rate-limit/rate-limit.ts";
import { sleep } from "../../sleep/sleep.ts";
import { defaultFetch } from "../api.ts";

export type DefineLimitedFetchOptions = RateLimitOptions & {
  /** Underlying fetch implementation. Defaults to `globalThis.fetch`. */
  fetch?: typeof globalThis.fetch;
  /**
   * How many times to retry after a rate-limit response (`429`, or `503` with
   * `Retry-After`). Defaults to `3`.
   */
  maxRetries?: number;
};

/**
 * Build a `fetch`-compatible function that paces requests via
 * `concurrency/rate-limit` and retries common rate-limit responses
 * (`429` / `503` + `Retry-After`).
 */
export const defineLimitedFetch = (
  options: DefineLimitedFetchOptions,
): typeof globalThis.fetch => {
  const {
    fetch: fetchImpl = defaultFetch,
    maxRetries = 3,
    max,
    interval,
  } = options;
  const limit = rateLimit({ max, interval });

  return async (input, init) => {
    const signal = init?.signal ?? undefined;
    let attempt = 0;

    // ponytail: sequential retry loop — each attempt awaits the previous
    /* eslint-disable no-await-in-loop -- intentional rate-limit retries */
    while (true) {
      signal?.throwIfAborted();

      const response = await limit(async () => fetchImpl(input, init), signal);

      if (!isRateLimited(response) || attempt >= maxRetries) {
        return response;
      }

      attempt++;
      const delayMs =
        parseRetryAfter(response.headers.get("Retry-After"), Date.now()) ??
        interval;

      void response.body?.cancel();
      await sleep(delayMs, signal);
    }
    /* eslint-enable no-await-in-loop */
  };
};

const isRateLimited = (response: Response) =>
  response.status === 429 ||
  (response.status === 503 && response.headers.has("Retry-After"));

/**
 * Parse `Retry-After` as delay-seconds or HTTP-date.
 * Returns milliseconds to wait, or `undefined` when the header is missing/invalid.
 */
export const parseRetryAfter = (
  value: string | null,
  now = Date.now(),
): number | undefined => {
  if (value === null || value === "") {
    return undefined;
  }

  const asSeconds = Number(value);
  if (Number.isFinite(asSeconds) && asSeconds >= 0) {
    return asSeconds * 1000;
  }

  const asDate = Date.parse(value);
  if (Number.isFinite(asDate)) {
    return Math.max(0, asDate - now);
  }

  return undefined;
};
