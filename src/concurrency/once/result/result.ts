import { isError } from "../../../lib/is-error.ts";
import { result, type Result } from "../../../result/result.ts";
import {
  withResultSnapshotProperty,
  type WithResultSnapshot,
} from "../../concurrency.result.lib.ts";
import { once as onceBase, type Once } from "../once.ts";

export type { WithResultSnapshot } from "../../concurrency.result.lib.ts";

export type OnceWithResult<Data> = Once<Data> & WithResultSnapshot<Data>;

/**
 * Like the base [`once`](../once.ts), but also exposes a synchronous `Result`
 * snapshot on `.result`.
 *
 * Import from `@peerigon/typescript-toolkit/concurrency/once/result` so the base
 * `/concurrency/once` entry stays free of the `result` dependency.
 */
export const once = <Data>(fn: () => Promise<Data>): OnceWithResult<Data> => {
  let snapshot: Result<Data> | undefined;

  const run = onceBase(async () => {
    snapshot = result.pending<Data>();
    try {
      const data = await fn();
      snapshot = result.success(data);
      return data;
    } catch (caughtError) {
      if (isError(caughtError)) {
        snapshot = result.error(caughtError);
      } else {
        snapshot = undefined;
      }
      throw caughtError;
    }
  });

  return withResultSnapshotProperty(
    run,
    (): Result<Data> | undefined => snapshot,
  ) as OnceWithResult<Data>;
};
