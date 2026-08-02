import { isError } from "../../../lib/is-error.ts";
import { result, type Result } from "../../../result/result.ts";
import {
  withResultSnapshotProperty,
  type WithResultSnapshot,
} from "../../concurrency.result.lib.ts";
import {
  exactlyOnce as exactlyOnceBase,
  type ExactlyOnce,
} from "../exactlyOnce.ts";

export type { WithResultSnapshot } from "../../concurrency.result.lib.ts";

export type ExactlyOnceWithResult<
  Args extends Array<unknown>,
  Data,
> = ExactlyOnce<Args, Data> & WithResultSnapshot<Data>;

/**
 * Like the base [`exactlyOnce`](../exactlyOnce.ts), but also exposes a
 * synchronous `Result` snapshot on `.result`.
 *
 * Import from `@peerigon/typescript-toolkit/concurrency/exactlyOnce/result` so
 * the base `/concurrency/exactlyOnce` entry stays free of the `result`
 * dependency.
 */
export const exactlyOnce = <Args extends Array<unknown>, Data>(
  fn: (...args: Args) => Promise<Data>,
): ExactlyOnceWithResult<Args, Data> => {
  let snapshot: Result<Data> | undefined;

  const run = exactlyOnceBase(async (...args: Args) => {
    snapshot = result.pending<Data>();
    try {
      const data = await fn(...args);
      snapshot = result.success(data);
      return data;
    } catch (caughtError) {
      // Failures are terminal (unlike once), so keep an error snapshot even for
      // non-Error rejections — clearing would look like "never called".
      snapshot = result.error(
        isError(caughtError)
          ? caughtError
          : new Error("Non-Error rejection", { cause: caughtError }),
      );
      throw caughtError;
    }
  });

  return withResultSnapshotProperty(
    run,
    (): Result<Data> | undefined => snapshot,
  ) as ExactlyOnceWithResult<Args, Data>;
};
