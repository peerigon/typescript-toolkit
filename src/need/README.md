## `need`

- 📦 Below 150 Bytes
- ✅ Zero dependencies

Assert that the given `value` is not `null` or `undefined` and return it with a narrowed type.

### Basic usage

```ts
import { need } from "@peerigon/typescript-toolkit/need";

// Call need() to remove undefined | null from the type
// Throws a TypeError at runtime if the value is null or undefined.
const userName: string = need(maybeUserName);
```

### With custom error message

```ts
// With custom error message
const userName = need(maybeUserName, "User name is required but not found");

// Custom error messages just for the development build. Production builds will remove the message. In that case, a generic default error message is used.
const userName = need(
  maybeUserName,
  import.meta.env.DEV && "User name is required but not found",
);

// Custom error message can also be a function that will
// only be evaluated when the error is thrown
const userName = need(
  maybeUserName,
  () => "User name is required but not found",
);
```

### API Reference

#### `need(value, errorMessage?)`

Returns `value` with `null` and `undefined` removed from its type, or throws.

```ts
need<Value>(value: Value, errorMessage?: ErrorMessage): NonNullable<Value>
```

| Type parameter | Description             |
| -------------- | ----------------------- |
| `Value`        | Type of the input value |

| Parameter      | Type                      | Description                                                                                                 |
| -------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `value`        | `Value`                   | Value to check for `null` or `undefined`                                                                    |
| `errorMessage` | `ErrorMessage` (optional) | Custom message: `string`, `false`, or a lazy function. Default: `"Expected value to be defined, but got …"` |

**Returns:** `NonNullable<Value>` — the same `value` when defined

**Throws:** `TypeError` when `value` is `null` or `undefined`
