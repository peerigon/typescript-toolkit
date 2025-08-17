import { getErrorMessage, type ErrorMessage } from "../lib/error-message.ts";
import { simpleStringify } from "../lib/string.ts";

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
