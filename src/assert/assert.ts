/**
 * Asserts that a given `value` is not `null`, `undefined`, or `false`,
 * and narrows its type.
 *
 * Unlike regular truthiness checks, `assert` only rejects `null`, `undefined`,
 * and `false` while allowing other falsy values like `0`, `""`, and `NaN` to pass through.
 */
export const assert = <Value>(
  value: Value,
  message?: string | (() => string) | false,
): asserts value is NonNullable<Value> & Exclude<Value, false> => {
  if (value === undefined || value === null || value === false) {
    throwTypeError(value, message, "neither null, undefined, nor false");
  }
};

/**
 * Asserts that a given `value` is truthy,
 * and narrows its type to exclude falsy values.
 *
 * This function performs a standard truthiness check, rejecting
 * all falsy values: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`.
 */
assert.truthy = (value: unknown, message?: Message): asserts value => {
  if (!value) {
    throwTypeError(value, message, "truthy value");
  }
};

type Message = string | (() => string) | false | undefined;

const throwTypeError = (
  value: unknown,
  message: Message,
  expectation: string,
) => {
  throw new TypeError(
    typeof message === "function"
      ? message()
      : // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        message ||
        `Assertion failed: expected ${expectation}, but got ${
          // Conversion to string is necessary because JSON.stringify(undefined) returns undefined
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
          String(JSON.stringify(value))
        }`,
  );
};
