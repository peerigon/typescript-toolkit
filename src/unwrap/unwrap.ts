import { stringify } from "../lib/string.ts";
import { isResult, type Result } from "../result/result.ts";

/**
 * Unwrap a value from Result or nullable types, returning the underlying value or throwing an error.
 *
 * This function safely extracts values from wrapped types like Result,
 * handling null/undefined values and providing fallback mechanisms.
 *
 * @param maybeValue - The value to unwrap (can be a plain value or Result)
 * @param fallback - Optional fallback value to return instead of throwing
 * @returns The unwrapped value or fallback
 * @throws {TypeError} When the value cannot be unwrapped and no fallback is provided
 *
 * @example
 * ```ts
 * // Basic unwrapping
 * const value = unwrap("hello"); // "hello"
 * const nullValue = unwrap(null, "default"); // "default"
 *
 * // With Result types
 * const success = result.success({ data: "success" });
 * const data = unwrap(success); // "success"
 *
 * const error = result.error({ error: new Error("failed") });
 * const fallback = unwrap(error, "default"); // "default"
 * ```
 */
export function unwrap<Value, GivenError extends Error>(
  maybeValue: Value | Result<Value, GivenError>,
): Value;
export function unwrap<Value>(
  maybeValue: Result.Success<Value> | Result.Pending<Value>,
  fallback: unknown,
): Value;
export function unwrap<Value, GivenError extends Error, const Fallback>(
  maybeValue: Result.Error<GivenError, Value>,
  fallback: Fallback,
): Fallback;
export function unwrap<Value, GivenError extends Error, const Fallback>(
  maybeValue: Value | Result<Value, GivenError>,
  fallback: Fallback,
): NonNullable<Value> | Fallback;
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function unwrap<Value, GivenError extends Error, Fallback>(
  maybeValue: Value | Result<Value, GivenError>,
  fallback?: Value,
): Value | Fallback {
  const hasFallback = arguments.length > 1;

  if (maybeValue === null || maybeValue === undefined) {
    if (hasFallback) return fallback!;
    throw new TypeError(`${errorPrefix}Value is ${stringify(maybeValue)}`);
  }

  if (isResult(maybeValue)) {
    // Handle pending state
    if ("isPending" in maybeValue && maybeValue.isPending) {
      if (maybeValue.data === undefined) {
        if (hasFallback) return fallback!;
        throw new TypeError(typeErrorMessageForResult(maybeValue), {
          cause: maybeValue,
        });
      }
      return maybeValue.data as Value;
    }

    // Handle error state
    if (maybeValue.isError) {
      if (hasFallback) return fallback!;
      throw new TypeError(typeErrorMessageForResult(maybeValue), {
        cause: maybeValue,
      });
    }

    // Handle success state
    return maybeValue.data;
  }

  return maybeValue;
}

const errorPrefix = "Cannot unwrap: ";
const typeErrorMessageForResult = (maybeValue: unknown) =>
  `${errorPrefix}${String(maybeValue)} is not a success and there is no fallback`;
