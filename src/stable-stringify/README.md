## `stable-stringify`

- 📦 Below **750 B** minified + compressed (brotli)
- ✅ Zero dependencies

Deterministic stringification for JSON values and common non-JSON types (`BigInt`, `Symbol`, `Map`, `Set`, `Date`, `RegExp`). Plain object keys, `Map` entries, and `Set` values are sorted so insertion order does not affect the result.

Output is a **JS-expression string**. Pure JSON inputs stay valid JSON; values with `Map` / `BigInt` / etc. are not `JSON.parse`-able.

In case you're dealing with JSON-only input, use [`stableJsonStringify`](./json/README.md). It's smaller and faster.

### Basic usage

```ts
import { stableStringify } from "@peerigon/typescript-toolkit/stable-stringify";

stableStringify({ page: 1, status: "active" });
// '{"page":1,"status":"active"}'

stableStringify(
  new Map([
    ["b", 2],
    ["a", 1],
  ]),
);
// 'Map([["a",1],["b",2]])'

stableStringify({ id: 1n, tag: Symbol.for("x") });
// '{"id":1n,"tag":Symbol.for("x")}'
```

### API Reference

#### `StableStringifyValue`

```ts
type StableStringifyValue =
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
```

#### `stableStringify(value)`

```ts
stableStringify(value: StableStringifyValue): string
```

| Parameter | Type                   | Description        |
| --------- | ---------------------- | ------------------ |
| `value`   | `StableStringifyValue` | Value to stringify |

**Returns:** `string` — canonical representation

### ⚠️ Behavior Notes

- **Object key order**: Sorted alphabetically
- **Array order**: Preserved
- **Map / Set order**: Sorted by stringified key / value (not insertion order); Map ties on key are broken by value
- **Invalid Date**: `Date(NaN)` (does not throw)
- **Undefined in objects**: Omitted
- **Undefined at root**: Type error (`StableStringifyValue` excludes it)
- **Undefined in arrays**: `null` (JSON-compatible)
- **Undefined in Map/Set**: Literal `undefined`
- **Numbers**: Preserves `NaN`, `Infinity`, `-Infinity`, `-0`
- **Symbols**: Well-known → `Symbol.iterator`; registered → `Symbol.for("…")`; else `Symbol("…")` (local symbols with the same description collide)
- **Unsupported at compile time**: Functions, `WeakMap`, `WeakSet`, promises, etc. (`WeakMap` / `WeakSet` are not enumerable, so they cannot be fingerprinted)
- **Unexpected runtime values**: Throw `TypeError` as a last resort (e.g. when types are bypassed)
- **Circular references**: Emit `Circular(n)` — see below
- **Not round-trippable**: Output is for hashing / comparison keys, not `eval` / revive

### Circular references

Cycles emit `Circular(n)` where `n` is how many steps **up the ancestor stack** the back-edge points (`1` = parent, including `o.self = o`).

```ts
const self: { self?: object } = {};
self.self = self;
stableStringify(self);
// '{"self":Circular(1)}'

const root: { a?: { b?: object }; c?: number } = { c: 1 };
root.a = { b: root };
stableStringify(root);
// '{"a":{"b":Circular(2)},"c":1}'

const parent: { a?: { b?: object; n?: number } } = {};
parent.a = { n: 1 };
parent.a.b = parent.a;
stableStringify(parent);
// '{"a":{"b":Circular(1),"n":1}}'
```

**Trade-offs**

- Distinguishes different cycle _targets_ on the same path (root vs parent) without path strings or much size cost
- Does **not** dedupe shared non-circular refs: `{ a: shared, b: shared }` prints `shared` twice (same content → same string, which is what you want for hashing)
- `n` is stack distance, not a stable object id or JSON pointer — enough to avoid colliding different cycle shapes, not enough to revive the graph
- Only ancestor cycles are detected (the walk’s path stack); that matches “circular reference” in the usual DFS sense
