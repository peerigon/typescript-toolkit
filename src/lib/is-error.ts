/**
 * Checks if the given value is an Error. Doesn't use `instanceof` so that
 * `DOMException` and errors from a different realm can be checked as well.
 *
 * TODO: Replace this with native `Error.isError` once it becomes Baseline on
 * MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError
 */
export const isError = (error: unknown): error is Error => {
  if ("isError" in Error && typeof Error.isError === "function") {
    const result: unknown = Error.isError(error);

    if (typeof result === "boolean") {
      return result;
    }
  }

  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof error.name === "string" &&
    "message" in error &&
    typeof error.message === "string" &&
    "stack" in error &&
    typeof error.stack === "string"
  );
};
