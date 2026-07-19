/**
 * Plain objects only — not arrays, boxed primitives, Date, Map, class
 * instances, etc. Accepts `Object.prototype` and `null` prototype.
 */
export const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};
