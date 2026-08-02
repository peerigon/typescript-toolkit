## `no-null`

- 📦 Below **240 B** minified + compressed (brotli)
- ✅ Zero dependencies

Convert between `null` and `undefined` in plain JSON-like values — at runtime and at the type level. Built for codebases that follow the [`no-null`](https://github.com/peerigon/configs/blob/main/eslint/README.md#no-null) style: prefer `undefined` internally, translate at trust boundaries where JSON (or other APIs) still use `null`.

### Basic usage

```ts
import {
  NULL,
  nullToUndefined,
  undefinedToNull,
  type NullToUndefined,
  type UndefinedToNull,
} from "@peerigon/typescript-toolkit/no-null";

// Pass null to an API without a null literal
someApi.clearValue(NULL);

// Incoming JSON → no-null world (mutates in place)
nullToUndefined({ name: NULL, tags: ["a", NULL] });
// { name: undefined, tags: ["a", undefined] }

// Outgoing payload → JSON nulls (mutates in place)
undefinedToNull({ name: undefined, tags: ["a", undefined] });
// { name: null, tags: ["a", null] }

type ApiUser = { name: string | null; bio?: string | null };
type AppUser = NullToUndefined<ApiUser>;
// { name: string | undefined; bio?: string | undefined }

type JsonUser = UndefinedToNull<AppUser>;
// { name: string | null; bio?: string | null }
```

### API Reference

#### `NULL`

The `null` value. Use instead of a `null` literal when an API expects `null` but you don't want to ignore a `no-null` lint warning.

```ts
const NULL: null;
```

#### `nullToUndefined(value)`

Deeply replaces every `null` with `undefined` in plain JSON-like values. Mutates plain objects and arrays in place.

```ts
nullToUndefined<Value>(value: Value): NullToUndefined<Value>
```

| Parameter | Type    | Description                                               |
| --------- | ------- | --------------------------------------------------------- |
| `value`   | `Value` | Plain JSON-like input (primitives, arrays, plain objects) |

**Returns:** Same value with `null` → `undefined`

#### `undefinedToNull(value)`

Deeply replaces every `undefined` with `null` in plain JSON-like values. Mutates plain objects and arrays in place.

```ts
undefinedToNull<Value>(value: Value): UndefinedToNull<Value>
```

| Parameter | Type    | Description                                                                      |
| --------- | ------- | -------------------------------------------------------------------------------- |
| `value`   | `Value` | Plain JSON-like input (primitives, arrays, plain objects), including `undefined` |

**Returns:** Same value with `undefined` → `null`

#### `NullToUndefined<Value>`

Type-level equivalent of `nullToUndefined`: recursively replaces `null` with `undefined`.

#### `UndefinedToNull<Value>`

Type-level equivalent of `undefinedToNull`: recursively replaces `undefined` with `null`.

### ⚠️ Behavior Notes

- **Mutates in place**: Plain objects and arrays are modified; the same reference is returned. Clone first (e.g. `structuredClone`) if you still need the original
- **Supported values**: `null`, `undefined`, booleans, numbers, strings, arrays, plain objects (`Object.prototype` or `null` prototype)
- **Non-plain objects**: Left unchanged (e.g. `Date`, class instances, `Map`)
- **Missing keys**: Not invented — only existing own enumerable properties are visited
- **Circular / shared references**: Safe — containers are visited once (via `mapLeaves`)
- **Tuples**: Type helpers preserve tuple length and element positions
