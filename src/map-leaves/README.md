## `map-leaves`

- 📦 Below **210 B** minified + compressed (brotli)
- ✅ Zero dependencies

Deeply map every leaf in a plain JSON-like value. Mutates arrays and plain objects in place.

### Basic usage

```ts
import {
  mapLeaves,
  type Leaves,
  type ReplaceLeaves,
} from "@peerigon/typescript-toolkit/map-leaves";

mapLeaves({ name: null, tags: ["a", null] }, (leaf) =>
  leaf === null ? undefined : leaf,
);
// { name: undefined, tags: ["a", undefined] }

type LeavesOfUser = Leaves<{ name: string | null; tags: Array<string> }>;
// string | null

type WithoutNull = ReplaceLeaves<
  { name: string | null; tags: Array<string | null> },
  null,
  undefined
>;
// { name: string | undefined; tags: Array<string | undefined> }
```

### API Reference

#### `mapLeaves(value, map)`

Walks arrays and plain objects, calling `map` for every leaf. Containers are mutated in place; the same reference is returned.

```ts
mapLeaves<Value, MappedLeaf>(
  value: Value,
  map: (leaf: Leaves<Value>) => MappedLeaf,
): MapLeavesResult<Value, MappedLeaf>
```

| Parameter | Type                                  | Description                                               |
| --------- | ------------------------------------- | --------------------------------------------------------- |
| `value`   | `Value`                               | Plain JSON-like input (primitives, arrays, plain objects) |
| `map`     | `(leaf: Leaves<Value>) => MappedLeaf` | Replaces each leaf with the returned value                |

**Returns:** Same structure as `value`. If `MappedLeaf` is assignable to the original leaf union, the input type is kept; otherwise every leaf becomes `MappedLeaf`.

#### `Leaves<Value>`

Union of every leaf type in `Value` (arrays and plain objects are walked; built-ins like `Date` stay atomic).

#### `ReplaceLeaves<Value, From, To>`

Type-level leaf replace: every leaf assignable to `From` becomes `To`. Use this for precise transforms (e.g. `null` → `undefined`); `mapLeaves`' return type is intentionally coarser when the mapper widens leaves.

#### `MapLeavesResult<Value, MappedLeaf>`

Return type of `mapLeaves`.

### ⚠️ Behavior Notes

- **Mutates in place**: Plain objects and arrays are modified. Clone first (e.g. `structuredClone`) if you still need the original
- **Leaves**: Anything that is not an array or plain object — including `Date`, class instances, `Map`, primitives, `null`, and `undefined`
- **Plain objects**: `Object.prototype` or `null` prototype only
- **Missing keys**: Not invented — only existing own enumerable properties are visited
- **Circular / shared references**: Objects and arrays are visited once via a `WeakSet`; cycles and shared subtrees are safe
- **Type-level built-ins**: `Date`, `Map`, `RegExp`, etc. are treated as atomic leaves; arbitrary class instances may still look like plain objects to TypeScript
