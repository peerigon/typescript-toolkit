import {
  promiseWithResolvers,
  withPromiseProperty,
  type WithPromise,
} from "../concurrency.lib.ts";

export type ExactlyOnce<Args extends Array<unknown>, Data> = ((
  ...args: Args
) => Promise<Data>) &
  WithPromise<Data>;

/**
 * Wraps an async function so it may be invoked exactly once.
 *
 * A second call — including a concurrent one while the first is in flight —
 * throws immediately. Failures are terminal: there is no retry.
 *
 * Use `promise` to await the outcome passively until something else invokes
 * the function. For a synchronous `Result` snapshot, import from
 * `@peerigon/typescript-toolkit/concurrency/exactlyOnce/result`.
 */
export const exactlyOnce = <Args extends Array<unknown>, Data>(
  fn: (...args: Args) => Promise<Data>,
): ExactlyOnce<Args, Data> => {
  let started = false;
  const {
    promise: passivePromise,
    resolve: resolvePassive,
    reject: rejectPassive,
  } = promiseWithResolvers<Data>();

  // Non-async so a second call throws synchronously instead of returning a rejected promise.
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  const run = (...args: Args): Promise<Data> => {
    if (started) {
      throw new Error("Function was already invoked");
    }
    started = true;

    const invoke = async (): Promise<Data> => {
      try {
        const data = await fn(...args);
        resolvePassive(data);
        return data;
      } catch (caughtError) {
        rejectPassive(caughtError);
        throw caughtError;
      }
    };

    return invoke();
  };

  return withPromiseProperty(run, passivePromise);
};
