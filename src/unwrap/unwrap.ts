import { isAsync, type Async } from "../async/async.ts";
import { stringify } from "../lib/string.ts";
import { isResult, type Result } from "../result/result.ts";

export function unwrap<Value, GivenError extends Error>(
  maybeValue: Value | Result<Value, GivenError> | Async<Value, GivenError>,
): Value;
export function unwrap<Value>(
  maybeValue:
    | Result.Success<Value>
    | Async.Success<Value>
    | Async.Pending<Value>,
  fallback: unknown,
): Value;
export function unwrap<Value, GivenError extends Error, const Fallback>(
  maybeValue: Result.Error<GivenError, Value>,
  fallback: Fallback,
): Fallback;
export function unwrap<Value, GivenError extends Error, const Fallback>(
  maybeValue: Value | Result<Value, GivenError> | Async<Value, GivenError>,
  fallback: Fallback,
): NonNullable<Value> | Fallback;
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function unwrap<Value, GivenError extends Error, Fallback>(
  maybeValue: Value | Result<Value, GivenError> | Async<Value, GivenError>,
  fallback?: Value,
): Value | Fallback {
  const hasFallback = arguments.length > 1;

  if (maybeValue === null || maybeValue === undefined) {
    if (hasFallback) return fallback!;
    throw new TypeError(`${errorPrefix}Value is ${stringify(maybeValue)}`);
  }

  if (isResult(maybeValue)) {
    if (maybeValue.isError) {
      if (hasFallback) return fallback!;
      throw new TypeError(typeErrorMessageForResult(maybeValue));
    }

    return maybeValue.data;
  }

  if (isAsync(maybeValue)) {
    if (
      maybeValue.isError ||
      (maybeValue.isPending && maybeValue.data === undefined)
    ) {
      if (hasFallback) return fallback!;
      throw new TypeError(typeErrorMessageForResult(maybeValue));
    }

    return maybeValue.data as Value; // Why is the type assertion necessary here?
  }

  return maybeValue;
}

const errorPrefix = "Cannot unwrap: ";
const typeErrorMessageForResult = (maybeValue: unknown) =>
  `${errorPrefix}${String(maybeValue)} is not a success and there is no fallback`;
