export type { MetadataStore };

/**
 * A typed metadata store backed by a per-channel WeakMap.
 */
type MetadataStore<Value, Target extends object = object> = {
  /**
   * Returns metadata attached to `target`, or `undefined` when none is set.
   */
  get: (target: Target) => Value | undefined;

  /**
   * Attaches metadata to `target` and returns `target`.
   */
  set: (target: Target, value: Value) => Target;

  /**
   * Returns whether metadata is attached to `target`.
   */
  has: (target: Target) => boolean;

  /**
   * Removes metadata from `target`.
   */
  delete: (target: Target) => boolean;
};

const defineMetadata = <Value, Target extends object = object>(): MetadataStore<
  Value,
  Target
> => {
  const store = new WeakMap<Target, Value>();

  return {
    get: (target) => store.get(target),
    set: (target, value) => {
      store.set(target, value);
      return target;
    },
    has: (target) => store.has(target),
    delete: (target) => store.delete(target),
  };
};

/**
 * Utilities for attaching typed metadata to objects.
 */
export const metadata = {
  /**
   * Define a metadata store for a specific value type.
   *
   * Each store keeps its own WeakMap, so different stores never collide.
   *
   * @returns A metadata store with `get`, `set`, `has`, and `delete`
   *
   * @example
   * ```ts
   * type ResultMetadata = { source: string };
   *
   * const resultMetadata = metadata.define<ResultMetadata>();
   *
   * const result = { ok: true };
   * resultMetadata.set(result, { source: "api" });
   * resultMetadata.get(result); // { source: "api" }
   * ```
   */
  define: defineMetadata,
};
