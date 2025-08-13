/**
 * Stringify a value to a string using JSON.stringify.
 * Fallback to String(value) if JSON.stringify fails.
 *
 * @param value - The value to stringify.
 * @param options - The options for the stringification.
 * @param options.limit - The maximum number of characters to include in the string. Defaults to 50.
 * @returns The stringified value.
 */
export const stringify = (
  value: unknown,
  {
    limit = 50,
  }: {
    limit?: number;
  } = {},
) => {
  let stringified;

  try {
    stringified = JSON.stringify(value, null, 2);
  } catch {
    // Do nothing
  }

  // Empty string should also use String(value)
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  stringified ||= String(value);

  return limit === 0
    ? ""
    : stringified.length > limit
      ? stringified.slice(0, limit) + "…"
      : stringified;
};
