import { getErrorMessage, type ErrorMessage } from "../lib/error-message.ts";
import { simpleStringify } from "../lib/string.ts";

/**
 * Asserts that a given `value` is not `null` or `undefined`, and narrows its type.
 *
 * Unlike regular truthiness checks, `assert` only rejects `null` and `undefined`
 * while allowing other falsy values like `false`, `0`, `""`, and `NaN` to pass through.
 *
 * @param value - The value that shouldn't be `null` or `undefined`.
 * @param errorMessage - The error message to throw if the value is `null` or `undefined`.
 */
export const assert = <Value>(
  value: Value,
  errorMessage?: ErrorMessage,
): asserts value is NonNullable<Value> => {
  if (value === undefined || value === null) {
    throwTypeError(value, errorMessage, "neither null nor undefined");
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
