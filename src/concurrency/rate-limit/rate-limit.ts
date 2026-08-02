import { sleep } from "../../sleep/sleep.ts";

export type RateLimit = <Data>(
  task: () => Promise<Data>,
  signal?: AbortSignal,
) => Promise<Data>;

export type RateLimitOptions = {
  /** Maximum number of tasks that may start within `interval`. */
  max: number;
  /** Sliding window length in milliseconds. */
  interval: number;
};

/**
 * Create a rate limiter that schedules async tasks so at most `max` start
 * within any sliding `interval` window.
 *
 * Admission is serialized; tasks may still run concurrently after they start.
 * Pass an `AbortSignal` to cancel while waiting for admission (does not
 * consume a slot).
 */
export const rateLimit = ({ max, interval }: RateLimitOptions): RateLimit => {
  if (max < 1) {
    throw new TypeError(`max must be >= 1, got ${max}`);
  }
  if (interval < 1) {
    throw new TypeError(`interval must be >= 1, got ${interval}`);
  }

  const startedAt: Array<number> = [];
  let gate = Promise.resolve();

  return async <Data>(
    task: () => Promise<Data>,
    signal?: AbortSignal,
  ): Promise<Data> => {
    const admitted = gate.then(async () => {
      signal?.throwIfAborted();

      const now = Date.now();
      prune(startedAt, now - interval);

      if (startedAt.length >= max) {
        const wait = startedAt[0]! + interval - Date.now();
        if (wait > 0) {
          await sleep(wait, signal);
        }
        prune(startedAt, Date.now() - interval);
      }

      signal?.throwIfAborted();
      startedAt.push(Date.now());
    });

    gate = admitted.then(
      () => undefined,
      () => undefined,
    );

    await admitted;
    return task();
  };
};

const prune = (startedAt: Array<number>, cutoff: number) => {
  while (startedAt.length > 0 && startedAt[0]! <= cutoff) {
    startedAt.shift();
  }
};
