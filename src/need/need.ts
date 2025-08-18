import { getErrorMessage, type ErrorMessage } from "../lib/error-message.ts";
import { simpleStringify } from "../lib/string.ts";

/**
 * Assert that a given value is not `null` or `undefined`, and narrow its type.
 *
 * Unlike `assert`, this function only handles nullish values (`null`, `undefined`)
 * and does not reject `false` or other falsy values.
 *
 * @param value - The value to check for nullish values
 * @param errorMessage - Custom error message or function that returns an error message
 * @returns The value with nullish types removed from its type signature
 * @throws {TypeError} When value is `null` or `undefined`
 *
 * @example
 * ```ts
 * const maybeString: string | null = getValue();
 * const definiteString = need(maybeString); // throws if null
 * // TypeScript now knows definiteString is string, not string | null
 * ```
 */
export const need = <Value>(
  value: Value,
  errorMessage?: ErrorMessage,
): NonNullable<Value> => {
  if (value === undefined || value === null) {
    throw new TypeError(
      getErrorMessage(
        errorMessage,
        () => `Expected value to be defined, but got ${simpleStringify(value)}`,
      ),
    );
  }
  return value;
};
