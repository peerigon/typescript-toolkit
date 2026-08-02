import { isPlainObject } from "../lib/is-plain-object.ts";

/**
 * Deeply maps every leaf in a plain JSON-like value, mutating arrays and plain
 * objects in place.
 *
 * A leaf is any value that is not an array or plain object
 * (`Object.prototype` or `null` prototype). Non-plain objects (`Date`, class
 * instances, `Map`, …) are treated as leaves and passed to `map` unchanged by
 * the walker.
 *
 * Clone first (e.g. `structuredClone`) if you still need the original tree.
 *
 * @param value - A plain JSON-like value (primitives, arrays, plain objects)
 * @param map - Called for every leaf; return value replaces the leaf
 * @returns The same value (containers) or the mapped root leaf
 *
 * @example
 * ```ts
 * mapLeaves({ name: null, tags: ["a", null] }, (leaf) =>
 *   leaf === null ? undefined : leaf,
 * );
 * // { name: undefined, tags: ["a", undefined] }
 * ```
 */
export const mapLeaves = <Value, MappedLeaf>(
  value: Value,
  map: (leaf: Leaves<Value>) => MappedLeaf,
): MapLeavesResult<Value, MappedLeaf> => {
  const seen = new WeakSet<object>();

  const walk = (current: unknown): unknown => {
    if (Array.isArray(current)) {
      if (seen.has(current)) {
        return current;
      }

      seen.add(current);

      for (let index = 0; index < current.length; index++) {
        current[index] = walk(current[index]);
      }

      return current;
    }

    if (isPlainObject(current)) {
      if (seen.has(current)) {
        return current;
      }

      seen.add(current);

      for (const key of Object.keys(current)) {
        current[key] = walk(current[key]);
      }

      return current;
    }

    return map(current as Leaves<Value>);
  };

  return walk(value) as MapLeavesResult<Value, MappedLeaf>;
};

/**
 * Built-in / host objects that are treated as atomic leaves (not walked).
 * Approximates runtime `isPlainObject` / `Array.isArray` checks at the type
 * level — arbitrary class instances may still look like plain objects to TS.
 */
type BuiltInLeaf =
  | Date
  | RegExp
  | Error
  | ((...arguments_: Array<never>) => unknown)
  | Map<unknown, unknown>
  | Set<unknown>
  | WeakMap<object, unknown>
  | WeakSet<object>
  | Promise<unknown>
  | ArrayBuffer
  | DataView;

/**
 * Union of every leaf type in `Value` (arrays and plain objects are walked).
 */
export type Leaves<Value> = Value extends BuiltInLeaf
  ? Value
  : Value extends ReadonlyArray<infer Item>
    ? Leaves<Item>
    : Value extends object
      ? { [Key in keyof Value]: Leaves<Value[Key]> }[keyof Value]
      : Value;

/**
 * Deeply replaces every leaf that is assignable to `From` with `To`.
 */
export type ReplaceLeaves<Value, From, To> = Value extends BuiltInLeaf
  ? Value
  : Value extends From
    ? To
    : Value extends ReadonlyArray<infer _Item>
      ? { [Index in keyof Value]: ReplaceLeaves<Value[Index], From, To> }
      : Value extends object
        ? { [Key in keyof Value]: ReplaceLeaves<Value[Key], From, To> }
        : Value;

/**
 * Return type of {@link mapLeaves}: keeps `Value` when `MappedLeaf` is
 * assignable to the original leaf union (identity-style maps); otherwise
 * replaces every leaf with `MappedLeaf`.
 */
export type MapLeavesResult<Value, MappedLeaf> = [MappedLeaf] extends [
  Leaves<Value>,
]
  ? Value
  : MappedLeaves<Value, MappedLeaf>;

/**
 * Replaces every leaf in `Value` with `MappedLeaf`.
 */
type MappedLeaves<Value, MappedLeaf> = Value extends BuiltInLeaf
  ? MappedLeaf
  : Value extends ReadonlyArray<infer _Item>
    ? { [Index in keyof Value]: MappedLeaves<Value[Index], MappedLeaf> }
    : Value extends object
      ? { [Key in keyof Value]: MappedLeaves<Value[Key], MappedLeaf> }
      : MappedLeaf;
