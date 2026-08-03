import { getErrorMessage, type ErrorMessage } from "../lib/error-message.ts";
import { stringify } from "../lib/string.ts";

/**
 * Asserts that a code path is unreachable, typically the `default` case of a
 * `switch`/`case` statement over a union type.
 *
 * TypeScript only accepts `value` if its type has already been narrowed to
 * `never`, i.e. all members of the union have been handled in the preceding
 * cases. This turns an unhandled case into a compile-time error as soon as
 * the union gains a new member, while still throwing at runtime if an
 * unexpected value slips through.
 *
 * @param value - The value that should be of type `never`.
 * @param errorMessage - The error message to throw.
 */
export const assertNever = (
  value: never,
  errorMessage?: ErrorMessage,
): never => {
  throw new TypeError(
    getErrorMessage(
      errorMessage,
      () => `Unexpected value: ${stringify(value)}`,
    ),
  );
};
