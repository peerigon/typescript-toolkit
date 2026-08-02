import { type Result } from "../result/result.ts";

export type WithResultSnapshot<Data> = {
  /**
   * Synchronous snapshot of the invocation — readable without calling the function again.
   *
   * - `undefined`: never called yet
   * - pending: a call is in flight
   * - success: the last call succeeded (`data` holds the result)
   * - error: the last call failed
   */
  readonly result: Result<Data> | undefined;
};

export const withResultSnapshotProperty = <Fn, Data>(
  fn: Fn,
  getResult: () => Result<Data> | undefined,
): Fn & WithResultSnapshot<Data> => {
  const wrapped = fn as Fn & WithResultSnapshot<Data>;

  Object.defineProperty(wrapped, "result", {
    get: getResult,
    enumerable: true,
  });

  return wrapped;
};
