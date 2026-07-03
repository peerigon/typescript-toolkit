## `metadata`

- 📦 Below 150 Bytes minified + compressed (brotli)
- ✅ Zero dependencies

Attach typed metadata to any object. Each `metadata.define()` call returns a store backed by its own `WeakMap`, so different stores never collide and metadata is garbage-collected with the target object.

### Basic usage

```ts
import { metadata } from "@peerigon/typescript-toolkit/metadata";

type ResultMetadata = { source: string };

const resultMetadata = metadata.define<ResultMetadata>();

const result = { ok: true };
resultMetadata.set(result, { source: "api" });

resultMetadata.get(result); // { source: "api" }
resultMetadata.has(result); // true
resultMetadata.delete(result); // true
```

### Multiple stores on one object

```ts
const resultMetadata = metadata.define<{ source: string }>();
const traceMetadata = metadata.define<{ traceId: string }>();

const target = { ok: true };

resultMetadata.set(target, { source: "api" });
traceMetadata.set(target, { traceId: "abc" });

resultMetadata.get(target); // { source: "api" }
traceMetadata.get(target); // { traceId: "abc" }
```

### API Reference

#### `metadata.define<Value, Target>()`

Creates a metadata store for a specific value type.

```ts
metadata.define<Value, Target extends object = object>(): MetadataStore<Value, Target>
```

| Type parameter | Default  | Description                                               |
| -------------- | -------- | --------------------------------------------------------- |
| `Value`        | required | Metadata value type stored by this store                  |
| `Target`       | `object` | Object type accepted by `get`, `set`, `has`, and `delete` |

**Returns:** A new `MetadataStore` instance

#### `MetadataStore.get(target)`

Returns metadata attached to `target`, or `undefined` when none is set.

```ts
get(target: Target): Value | undefined
```

| Parameter | Type     | Description         |
| --------- | -------- | ------------------- |
| `target`  | `Target` | Object to read from |

**Returns:** The stored metadata, or `undefined`

#### `MetadataStore.set(target, value)`

Attaches metadata to `target`.

```ts
set(target: Target, value: Value): Target
```

| Parameter | Type     | Description         |
| --------- | -------- | ------------------- |
| `target`  | `Target` | Object to attach to |
| `value`   | `Value`  | Metadata to store   |

**Returns:** `target`

#### `MetadataStore.has(target)`

Returns whether metadata is attached to `target`.

```ts
has(target: Target): boolean
```

| Parameter | Type     | Description     |
| --------- | -------- | --------------- |
| `target`  | `Target` | Object to check |

**Returns:** `true` when metadata is set, otherwise `false`

#### `MetadataStore.delete(target)`

Removes metadata from `target`.

```ts
delete(target: Target): boolean
```

| Parameter | Type     | Description     |
| --------- | -------- | --------------- |
| `target`  | `Target` | Object to clear |

**Returns:** `true` when metadata was removed, otherwise `false`
