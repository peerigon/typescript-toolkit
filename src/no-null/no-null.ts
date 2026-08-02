import { mapLeaves, type ReplaceLeaves } from "../map-leaves/map-leaves.ts";

/**
 * The `null` value — use this when an API expects `null` but you don't want to
 * write a `null` literal (which triggers
 * [`no-null`](https://github.com/peerigon/configs/blob/main/eslint/README.md#no-null)
 * lint warnings).
 *
 * @example
 * ```ts
 * someApi.clearValue(NULL);
 * ```
 */
export const NULL = null;

/**
 * Recursively replaces `null` with `undefined` in plain JSON-like values.
 *
 * Mutates plain objects and arrays in place. Useful at trust boundaries when
 * consuming JSON (or other null-heavy APIs) in a codebase that follows the
 * [`no-null`](https://github.com/peerigon/configs/blob/main/eslint/README.md#no-null)
 * style. Clone first (e.g. `structuredClone`) if you still need the original.
 *
 * @param value - A plain JSON-like value (primitives, arrays, plain objects)
 * @returns The same value with every `null` replaced by `undefined`
 *
 * @example
 * ```ts
 * nullToUndefined({ name: null, tags: ["a", null] });
 * // { name: undefined, tags: ["a", undefined] }
 * ```
 */
export const nullToUndefined = <Value>(value: Value): NullToUndefined<Value> =>
  mapLeaves(value, (leaf) => leaf ?? undefined) as NullToUndefined<Value>;

/**
 * Recursively replaces `undefined` with `null` in plain JSON-like values.
 *
 * Mutates plain objects and arrays in place. Useful when sending data to JSON
 * APIs that expect `null` instead of omitted or `undefined` properties. Clone
 * first (e.g. `structuredClone`) if you still need the original.
 *
 * @param value - A plain JSON-like value (primitives, arrays, plain objects), including `undefined`
 * @returns The same value with every `undefined` replaced by `null`
 *
 * @example
 * ```ts
 * undefinedToNull({ name: undefined, tags: ["a", undefined] });
 * // { name: null, tags: ["a", null] }
 * ```
 */
export const undefinedToNull = <Value>(value: Value): UndefinedToNull<Value> =>
  mapLeaves(value, (leaf) => leaf ?? NULL) as UndefinedToNull<Value>;

/**
 * Deeply replaces `null` with `undefined` in a type.
 */
export type NullToUndefined<Value> = ReplaceLeaves<Value, null, undefined>;

/**
 * Deeply replaces `undefined` with `null` in a type.
 */
export type UndefinedToNull<Value> = ReplaceLeaves<Value, undefined, null>;
