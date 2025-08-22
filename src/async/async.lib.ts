import type { Async } from "./async.ts";

export const asyncBrand = Symbol("Async");

/**
 * Checks if the given value is an async result.
 *
 * @param maybeValue - The value to check
 * @returns True if the value is an async result, false otherwise
 */
export const isAsync = (maybeValue: unknown): maybeValue is Async => {
  return (
    maybeValue !== null &&
    typeof maybeValue === "object" &&
    asyncBrand in maybeValue
  );
};
