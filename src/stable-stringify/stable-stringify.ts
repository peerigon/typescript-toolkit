import { isPlainObject } from "../lib/is-plain-object.ts";

/**
 * Values accepted by {@link stableStringify}.
 *
 * Excludes `undefined` at the root, functions, promises, weak collections, and
 * other non-serializable types — those fail at compile time instead of runtime.
 * Circular references become `Circular(n)` (see README).
 */
export type StableStringifyValue =
  | null
  | boolean
  | number
  | string
  | bigint
  | symbol
  | Date
  | RegExp
  | ReadonlyArray<StableStringifyValue | undefined>
  | ReadonlyMap<StableStringifyValue, StableStringifyValue | undefined>
  | ReadonlySet<StableStringifyValue | undefined>
  | { readonly [key: string]: StableStringifyValue | undefined };

const wellKnownSymbols = new Map(
  Object.getOwnPropertyNames(Symbol)
    .filter((key) => typeof Symbol[key as keyof typeof Symbol] === "symbol")
    .map((key) => [
      Symbol[key as keyof typeof Symbol] as symbol,
      `Symbol.${key}`,
    ]),
);

/**
 * Returns a deterministic string for {@link StableStringifyValue} inputs.
 *
 * Plain object keys are sorted alphabetically. `Map` entries are sorted by
 * key; `Set` values are sorted by their string form. Output is a JS-expression
 * string (not always `JSON.parse`-able when non-JSON types appear).
 *
 * Circular references emit `Circular(n)` where `n` is the distance up the
 * ancestor stack to the repeated object (`1` = parent / self-cycle).
 *
 * @param value - A {@link StableStringifyValue}
 * @returns Canonical string
 * @throws {TypeError} On unexpected runtime values (e.g. when the type system
 *   is bypassed with `as`)
 *
 * @example
 * ```ts
 * stableStringify({ page: 1, status: "active" });
 * // '{"page":1,"status":"active"}'
 *
 * stableStringify(new Map([["b", 2], ["a", 1]]));
 * // 'Map([["a",1],["b",2]])'
 *
 * const o: { self?: StableStringifyValue } = {};
 * o.self = o;
 * stableStringify(o);
 * // '{"self":Circular(1)}'
 * ```
 */
export const stableStringify = (value: StableStringifyValue): string =>
  stringifyValue(value, new WeakMap(), 0);

const stringifyValue = (
  value: StableStringifyValue,
  seen: WeakMap<object, number>,
  depth: number,
): string => {
  if (value === null) {
    return "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    // Preserve NaN / Infinity / -0 (JSON.stringify collapses these).
    return Object.is(value, -0) ? "-0" : String(value);
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "bigint") {
    return `${value}n`;
  }

  if (typeof value === "symbol") {
    return stringifySymbol(value);
  }

  if (typeof value === "object") {
    return stringifyObject(value, seen, depth);
  }

  // Last resort when the type system was bypassed (function, undefined, …).
  throw new TypeError("Unexpected value");
};

const stringifySymbol = (value: symbol): string => {
  const wellKnown = wellKnownSymbols.get(value);
  if (wellKnown !== undefined) {
    return wellKnown;
  }

  const globalKey = Symbol.keyFor(value);
  if (globalKey !== undefined) {
    return `Symbol.for(${JSON.stringify(globalKey)})`;
  }

  return `Symbol(${JSON.stringify(value.description ?? "")})`;
};

const stringifyObject = (
  value: Exclude<
    StableStringifyValue,
    null | string | number | boolean | bigint | symbol
  >,
  seen: WeakMap<object, number>,
  depth: number,
): string => {
  const ancestorDepth = seen.get(value);
  if (ancestorDepth !== undefined) {
    return `Circular(${depth - ancestorDepth})`;
  }

  if (Array.isArray(value)) {
    seen.set(value, depth);
    const items = value.map((item) =>
      item === undefined ? "null" : stringifyValue(item, seen, depth + 1),
    );
    seen.delete(value);
    return `[${items.join(",")}]`;
  }

  if (value instanceof Date) {
    // Invalid dates: toISOString() throws; mirror number NaN as Date(NaN).
    return Number.isNaN(value.getTime())
      ? "Date(NaN)"
      : `Date(${JSON.stringify(value.toISOString())})`;
  }

  if (value instanceof RegExp) {
    return `RegExp(${JSON.stringify(value.source)},${JSON.stringify(value.flags)})`;
  }

  if (value instanceof Map) {
    seen.set(value, depth);
    const entries = [...value.entries()]
      .map(
        ([key, entryValue]) =>
          [
            stringifyValue(key, seen, depth + 1),
            entryValue === undefined
              ? "undefined"
              : stringifyValue(entryValue, seen, depth + 1),
          ] as const,
      )
      // Tie-break on value so equal stringified keys stay deterministic.
      // eslint-disable-next-line unicorn/no-array-sort -- in-place for size
      .sort(([leftKey, leftValue], [rightKey, rightValue]) =>
        leftKey < rightKey
          ? -1
          : leftKey > rightKey
            ? 1
            : leftValue < rightValue
              ? -1
              : leftValue > rightValue
                ? 1
                : 0,
      )
      .map(([key, entryValue]) => `[${key},${entryValue}]`);
    seen.delete(value);
    return `Map([${entries.join(",")}])`;
  }

  if (value instanceof Set) {
    seen.set(value, depth);
    const items = [...value.values()]
      .map((item) =>
        item === undefined
          ? "undefined"
          : stringifyValue(item, seen, depth + 1),
      )
      // eslint-disable-next-line unicorn/no-array-sort -- in-place for size
      .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
    seen.delete(value);
    return `Set([${items.join(",")}])`;
  }

  // Plain objects / Object.create(null): own enumerable string keys.
  if (!isPlainObject(value)) {
    // Last resort for WeakMap, Promise, class instances, boxed primitives, …
    throw new TypeError("Unexpected value");
  }

  const record = value as Record<string, StableStringifyValue | undefined>;
  seen.set(record, depth);
  // eslint-disable-next-line unicorn/no-array-sort -- in-place for size
  const keys = Object.keys(record).sort();
  const properties: Array<string> = [];

  for (const key of keys) {
    const property = record[key];
    if (property === undefined) {
      continue;
    }
    properties.push(
      `${JSON.stringify(key)}:${stringifyValue(property, seen, depth + 1)}`,
    );
  }

  seen.delete(record);
  return `{${properties.join(",")}}`;
};
