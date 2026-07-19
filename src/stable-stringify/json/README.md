## `stable-stringify/json`

- 📦 Below **220 B** minified + compressed (brotli)
- ✅ Zero dependencies

JSON-only variant of [`stableStringify`](../README.md). Plain object keys are sorted alphabetically; output is always valid JSON. Use this when your input is guaranteed to be JSON-serializable.

### Basic usage

```ts
import { stableJsonStringify } from "@peerigon/typescript-toolkit/stable-stringify/json";

stableJsonStringify({ page: 1, status: "active" });
// '{"page":1,"status":"active"}'

stableJsonStringify({ status: "active", page: 1 });
// '{"page":1,"status":"active"}'
```

### API Reference

#### `JsonValue`

```ts
type JsonValue =
  | null
  | boolean
  | number
  | string
  | ReadonlyArray<JsonValue | undefined>
  | { readonly [key: string]: JsonValue | undefined };
```

#### `stableJsonStringify(value)`

```ts
stableJsonStringify(value: JsonValue): string
```

| Parameter | Type        | Description                   |
| --------- | ----------- | ----------------------------- |
| `value`   | `JsonValue` | JSON-serializable input value |

**Returns:** `string` — canonical JSON

### ⚠️ Behavior Notes

- **Object key order**: Sorted alphabetically for plain objects only
- **Array order**: Preserved
- **Undefined in objects**: Omitted
- **Undefined at root**: Type error (`JsonValue` excludes it)
- **Undefined in arrays**: Serialized as `null`
- **`toJSON` → `undefined`**: Serialized as `null` (keeps a JSON string return)
- **Unsupported at compile time**: `bigint`, `symbol`, `Date`, `Map`, functions, etc.
- For `Map` / `Set` / `BigInt` / etc., use [`stableStringify`](../README.md)
