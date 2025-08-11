import { isAsync, type Async } from "../async/async.ts";
import { isResult, type Result } from "../result/result.ts";

export function unwrap<Value>(
  maybeValue: Value | Result<Value> | Async<Value>,
): Value;
export function unwrap<Value, Fallback>(
  maybeValue: Value | Result<Value> | Async<Value>,
  fallback: Fallback,
): Value | Fallback;
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function unwrap<Value, Fallback>(
  maybeValue: Value | Result<Value> | Async<Value>,
  fallback?: Fallback,
): Value | Fallback {
  const hasFallback = arguments.length > 1;
  if (maybeValue === null || maybeValue === undefined) {
    if (hasFallback) return fallback!;
    throw new TypeError(`Unwrap failed: Value is ${String(maybeValue)}`);
  }

  if (isResult(maybeValue)) {
    if (maybeValue.isError) {
      if (hasFallback) return fallback!;
      throw new TypeError(
        `Unwrap failed: Result has no data, was ${JSON.stringify(maybeValue).slice(0, 30)}...`,
      );
    }

    return maybeValue.data;
  }

  if (isAsync(maybeValue)) {
    if (
      maybeValue.isError ||
      (maybeValue.isPending && maybeValue.data === undefined)
    ) {
      if (hasFallback) return fallback!;
      throw new TypeError(
        `Unwrap failed: Result has no data, was ${JSON.stringify(maybeValue).slice(0, 30)}...`,
      );
    }

    return maybeValue.data as Value; // Why is the type assertion necessary here?
  }

  return maybeValue;
}
