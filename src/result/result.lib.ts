import type { Result } from "./result.ts";

export const resultBrand = Symbol("Result");

/**
 * Checks if the given value is a result.
 *
 * @param maybeValue - The value to check
 * @returns True if the value is a result, false otherwise
 */
export const isResult = (maybeValue: unknown): maybeValue is Result => {
  return (
    maybeValue !== null &&
    typeof maybeValue === "object" &&
    resultBrand in maybeValue
  );
};
