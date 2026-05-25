## `assert`

- 📦 Below 200 Bytes
- ✅ Zero dependencies

Assert that a given `value` is not `null` or `undefined`, and narrow its type.

Unlike regular truthiness checks, `assert` only rejects `null` and `undefined` while allowing other falsy values like `false`, `0`, `""`, and `NaN` to pass through. Use `assert.truthy` if you need to check for truthiness.

### Basic usage

```ts
import { assert } from "@peerigon/typescript-toolkit/assert";

// Throws if user is null or undefined
assert(maybeUser);

// The type is narrowed to NonNullable<User>
const user: User = user;

// Only rejects null and undefined — other falsy values pass through
assert(0); // does not throw
assert(""); // does not throw
assert(NaN); // does not throw
assert(false); // does not throw
assert(null); // throws
assert(undefined); // throws

// Use assert.truthy to reject falsy values, such as 0 and ""
assert.truthy(count, "count must not be 0");

// assert.truthy can also be used for custom checks
assert.truthy(count > 3, "count must be greater than 3");
```

### With custom error message

```ts
// With custom error message
assert(user, "User must be logged in to access this feature");

// Custom error messages just for the development build. Production builds will remove the message. In that case, a generic default error message is used.
assert(
  user,
  import.meta.env.DEV &&
    "Some lengthy debugging message that should not leak into the production build",
);

// Custom error message can also be a function that will
// only be evaluated when the assertion fails
assert(user, () => generateExpensiveErrorMessage(user));
```

### API Reference

#### `assert(value, errorMessage?)`

Asserts that `value` is not `null` or `undefined` and narrows its type.

```ts
assert<Value>(value: Value, errorMessage?: ErrorMessage): asserts value is NonNullable<Value>
```

| Type parameter | Description                      |
| -------------- | -------------------------------- |
| `Value`        | Type of the value being asserted |

| Parameter      | Type                      | Description                                                                                                                          |
| -------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `value`        | `Value`                   | Value to assert is not `null` or `undefined`                                                                                         |
| `errorMessage` | `ErrorMessage` (optional) | Custom message: `string`, `false`, or a lazy function. Default: `"Assertion failed: expected neither null nor undefined, but got …"` |

**Throws:** `TypeError` when `value` is `null` or `undefined`

#### `assert.truthy(value, errorMessage?)`

Asserts that `value` is truthy and narrows its type.

```ts
assert.truthy(value: unknown, errorMessage?: ErrorMessage): asserts value
```

| Parameter      | Type                      | Description                                                                                                            |
| -------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `value`        | `unknown`                 | Value to assert is truthy                                                                                              |
| `errorMessage` | `ErrorMessage` (optional) | Custom message: `string`, `false`, or a lazy function. Default: `"Assertion failed: expected truthy value, but got …"` |

**Throws:** `TypeError` when `value` is falsy (`false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, or `NaN`)
