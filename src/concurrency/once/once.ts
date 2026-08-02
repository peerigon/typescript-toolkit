import {
  promiseWithResolvers,
  withPromiseProperty,
  type WithPromise,
} from "../concurrency.lib.ts";

export type Once<Data> = (() => Promise<Data>) & WithPromise<Data>;

/**
 * Wraps a zero-argument async function so that it runs at most once.
 *
 * While a call is in flight, concurrent callers share the same pending promise
 * (single-flight). Once it fulfills, the result is cached and returned to all
 * future callers without running `fn` again.
 *
 * Rejections are not cached: if the call rejects, the next call runs `fn` again.
 * This makes it a safe default for one-time initialization that may fail
 * transiently (e.g. bootstrapping a session or a storage layer).
 *
 * The returned function exposes a `promise` that passive waiters can await
 * without triggering the call themselves. For a synchronous `Result` snapshot,
 * import from `@peerigon/typescript-toolkit/concurrency/once/result`.
 */
export const once = <Data>(fn: () => Promise<Data>): Once<Data> => {
  let inFlightPromise: Promise<Data> | undefined;
  const { promise: passivePromise, resolve: resolvePassive } =
    promiseWithResolvers<Data>();

  const run = async (): Promise<Data> => {
    inFlightPromise ??= (async () => {
      try {
        const data = await fn();
        resolvePassive(data);
        return data;
      } catch (caughtError) {
        inFlightPromise = undefined;
        throw caughtError;
      }
    })();

    return inFlightPromise;
  };

  return withPromiseProperty(run, passivePromise);
};
