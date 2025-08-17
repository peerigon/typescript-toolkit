import { getErrorMessage, type ErrorMessage } from "../lib/error-message.ts";
import { simpleStringify } from "../lib/string.ts";

/**
 * Asserts that a given `value` is not `null`, `undefined`, or `false`,
 * and narrows its type.
 *
 * Unlike regular truthiness checks, `assert` only rejects `null`, `undefined`,
 * and `false` while allowing other falsy values like `0`, `""`, and `NaN` to pass through.
 *
 * @param value - The value that shouldn't be `null`, `undefined`, or `false`.
 * @param errorMessage - The error message to throw if the value is `null`, `undefined`, or `false`.
 */
export const assert = <Value>(
  value: Value,
  errorMessage?: ErrorMessage,
): asserts value is NonNullable<Value> & Exclude<Value, false> => {
  if (value === undefined || value === null || value === false) {
    throwTypeError(value, errorMessage, "neither null, undefined, nor false");
  }
};

/**
 * Asserts that a given `value` is truthy,
 * and narrows its type to exclude falsy values.
 *
 * This function performs a standard truthiness check, rejecting
 * all falsy values: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`.
 *
 * @param value - The value to assert the truthy check on.
 * @param errorMessage - The error message to throw if the value is falsy.
 */
assert.truthy = (
  value: unknown,
  errorMessage?: ErrorMessage,
): asserts value => {
  if (!value) {
    throwTypeError(value, errorMessage, "truthy value");
  }
};

const throwTypeError = (
  value: unknown,
  errorMessage: ErrorMessage,
  expectation: string,
) => {
  throw new TypeError(
    getErrorMessage(
      errorMessage,
      () =>
        `Assertion failed: expected ${expectation}, but got ${simpleStringify(value)}`,
    ),
  );
};
