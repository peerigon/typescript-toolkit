## `unwrap`

Safely extract values from [`Result`](../result/README.md), [`Async`](../async/README.md), or nullable types, with optional fallback support. Provides a unified interface for unwrapping different wrapped value types.

### Usage

#### Basic value unwrapping

```ts
import { unwrap } from "@peerigon/fractals-typescript/unwrap";

// Unwrap plain values. Won't throw.
const stringValue = unwrap("hello"); // "hello"
const numberValue = unwrap(42); // 42
const booleanValue = unwrap(true); // true

// Falsy values won't throw as well. They are not treated as errors.
const zero = unwrap(0); // 0
const emptyString = unwrap(""); // ""
const falsyBoolean = unwrap(false); // false
```

#### Unwrapping nullable values

```ts
// Without fallback, null/undefined throws
unwrap(null); // throws TypeError "Cannot unwrap: Value is null"

// Handle null/undefined with fallbacks
let result: "fallback";
result = unwrap(null, "fallback");
result = unwrap(undefined, "fallback");
```

#### Unwrapping Result types

```ts
import { result } from "@peerigon/fractals-typescript/result";

// Unwrap successful results
unwrap(result.success({ data: "user data" })); // "user data"

// Unwrap failed results throws
unwrap(result.error({ error: new Error("API failed") })); // Throws "API failed"
```

#### Unwrapping Async types

```ts
import { async } from "@peerigon/fractals-typescript/async";

// Unwrap successful async results
unwrap(async.success({ data: "loaded data" })); // "loaded data"

// Unwrap pending *without* data will throw
unwrap(async.pending()); // throws TypeError

// Unwrap pending *with* existing data won't throw!
unwrap(async.pending({ data: "stale data" })); // "stale data"

// Unwrap error async results with fallback
unwrap(async.error({ error: new Error("Load failed") })); // Throws "Load failed"
```

### API Reference

#### `unwrap(value)`

Unwraps a value, throwing if it cannot be extracted.

**Parameters**:

- `value`: Value to unwrap (plain value, Result, Async, or nullable)

**Returns**: The unwrapped value
**Throws**: `TypeError` if value is null, undefined, or an unsuccessful Result/Async

#### `unwrap(value, fallback)`

Unwraps a value, returning fallback if it cannot be extracted.

**Parameters**:

- `value`: Value to unwrap
- `fallback`: Value to return if unwrapping fails

**Returns**: The unwrapped value or fallback (never throws)

### Supported Types

#### Plain Values

- **Pass-through**: Returns the value as-is
- **null/undefined**: Throws without fallback, returns fallback with fallback

#### Result Types

- **Success**: Returns the `data` property
- **Error**: Throws without fallback, returns fallback with fallback

#### Async Types

- **Success**: Returns the `data` property
- **Pending with data**: Returns the `data` property
- **Pending without data**: Throws without fallback, returns fallback with fallback
- **Error**: Throws without fallback, returns fallback with fallback

### ⚠️ Behavior Notes

- **Falsy Pass-Through**: Falsy values like `0`, `""`, and `false` are returned as-is (not treated as unwrap failures)
- **Type Preservation**: Return types are inferred correctly for type safety
- **Unified Interface**: Provides consistent unwrapping for different wrapped types
- **Error Messages**: Descriptive error messages indicate why unwrapping failed
