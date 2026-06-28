## `unwrap`

- 📦 Below 395 Bytes minified + compressed (brotli)
- ✅ Zero dependencies

Safely extract values from [`Result`](../result/README.md) or nullable types, with optional fallback support.

### Unwrapping nullable values

```ts
import { unwrap } from "@peerigon/typescript-toolkit/unwrap";

// Without fallback, null/undefined throws
unwrap(null); // throws TypeError "Cannot unwrap: Value is null"

// Handle null/undefined with fallbacks
let result: "fallback";
result = unwrap(null, "fallback");
result = unwrap(undefined, "fallback");

// Unwrap plain values. Won't throw.
const stringValue = unwrap("hello"); // "hello"
const numberValue = unwrap(42); // 42
const booleanValue = unwrap(true); // true

// Falsy values won't throw as well. They are not treated as errors.
const zero = unwrap(0); // 0
const emptyString = unwrap(""); // ""
const falsyBoolean = unwrap(false); // false
```

### Unwrapping Result types

```ts
import { result } from "@peerigon/typescript-toolkit/result";

// Unwrap successful results
unwrap(result.success({ data: "user data" })); // "user data"

// Unwrap failed results throws
unwrap(result.error({ error: new Error("API failed") })); // Throws "API failed"
```

### Unwrapping `Promise.allSettled` results

```ts
const [user] = await Promise.allSettled([fetchUser()]);

unwrap(user); // returns user data when fulfilled or throws reason when rejected
unwrap(user, null); // returns null when rejected
```

### Unwrapping pending results

```ts
import { result } from "@peerigon/typescript-toolkit/result";

// Pending without data throws
unwrap(result.pending()); // throws TypeError

// Pending with stale data returns the data
unwrap(result.pending({ data: "stale data" })); // "stale data"

// Use a fallback when pending has no data
unwrap(result.pending(), "loading…"); // "loading…"
```

### API Reference

#### `unwrap(value, fallback?)`

Extracts a value from plain values, nullable values, `Result` instances, or `PromiseSettledResult`.

```ts
unwrap<Value, GivenError extends Error>(
  maybeValue: Value | Result<Value, GivenError> | PromiseFulfilledResult<Value>,
): Value

unwrap<Value, GivenError extends Error, Fallback>(
  maybeValue: Value | Result<Value, GivenError> | PromiseSettledResult<Value>,
  fallback: Fallback,
): Value | Fallback
```

| Parameter    | Type                                                                                | Description                                        |
| ------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------- |
| `maybeValue` | `Value \| Result<Value, Error> \| PromiseSettledResult<Value> \| null \| undefined` | Value to unwrap                                    |
| `fallback`   | `Fallback` (optional)                                                               | Returned instead of throwing when unwrapping fails |

**Returns:** `Value` or `Fallback` — underlying data for success/pending-with-data; plain values pass through

**Throws:** `TypeError` when `maybeValue` is `null`, `undefined`, a pending result without `data`, or an error result — and no `fallback` was provided. Failed `Result` unwraps include the result as `cause`. Rejected `PromiseSettledResult` values throw their `reason` when no `fallback` was provided.

#### Unwrap behavior

| Input                            | Without `fallback` | With `fallback`    |
| -------------------------------- | ------------------ | ------------------ |
| Plain value (including falsy)    | Returns as-is      | Returns as-is      |
| `null` / `undefined`             | Throws             | Returns `fallback` |
| `Result` success                 | Returns `data`     | Returns `data`     |
| `Result` pending with `data`     | Returns `data`     | Returns `data`     |
| `Result` pending without `data`  | Throws             | Returns `fallback` |
| `Result` error                   | Throws             | Returns `fallback` |
| `PromiseSettledResult` fulfilled | Returns `value`    | Returns `value`    |
| `PromiseSettledResult` rejected  | Throws `reason`    | Returns `fallback` |
