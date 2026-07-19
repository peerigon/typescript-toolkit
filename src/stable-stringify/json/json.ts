import { isPlainObject } from "../../lib/is-plain-object.ts";

/**
 * JSON-serializable values accepted by {@link stableJsonStringify}.
 *
 * Excludes `undefined` at the root, `bigint`, `symbol`, functions, and other
 * non-JSON types — those fail at compile time instead of runtime.
 */
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | ReadonlyArray<JsonValue | undefined>
  | { readonly [key: string]: JsonValue | undefined };

/**
 * Returns a deterministic JSON string for {@link JsonValue} inputs.
 *
 * Plain object keys are sorted alphabetically at every nesting level, so
 * property order does not affect the result.
 *
 * Prefer this over `stableStringify` from `/stable-stringify` when the
 * output must remain valid JSON.
 *
 * @param value - A {@link JsonValue}
 * @returns Canonical JSON string
 *
 * @example
 * ```ts
 * stableJsonStringify({ page: 1, status: "active" });
 * // '{"page":1,"status":"active"}'
 *
 * stableJsonStringify({ status: "active", page: 1 });
 * // '{"page":1,"status":"active"}'
 * ```
 */
export const stableJsonStringify = (value: JsonValue): string =>
  // toJSON may return undefined → JSON.stringify yields undefined; use null.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- TS types disagree with runtime
  JSON.stringify(value, (_, next: unknown): unknown => {
    if (!isPlainObject(next)) {
      return next;
    }

    const sorted: Record<string, unknown> = {};

    // Using in-place sort for performance reasons.
    // eslint-disable-next-line unicorn/no-array-sort
    for (const key of Object.keys(next).sort()) {
      sorted[key] = next[key];
    }

    return sorted;
  }) ?? "null";
