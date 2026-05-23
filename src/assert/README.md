## `assert`

- 📦 Below 200 Bytes
- ✅ Zero dependencies

Assert that a given `value` is not `null` or `undefined`, and narrow its type. This function provides both runtime validation and TypeScript type narrowing.

Unlike regular truthiness checks, `assert` only rejects `null` and `undefined` while allowing other falsy values like `false`, `0`, `""`, and `NaN` to pass through. Use `assert.truthy` if you need to check for truthiness.

### Usage

```ts
import { assert } from "@peerigon/typescript-toolkit/assert";

// Throws if user is null or undefined
assert(user);

// Type narrowing: removes null and undefined from the type
let maybeString: string | null | undefined = getValue();
assert(maybeString);
const length = maybeString.length;

// With custom error message
assert(user, "User must be logged in to access this feature");

// Custom error messages just for the development build. Production builds will remove the message. In that case, a generic default error message is used.
assert(
  user,
  import.meta.env.DEV &&
    "Some lengthy debugging message that should not leak into the production build",
);

// Only rejects null and undefined — other falsy values pass through
assert(0); // does not throw
assert(""); // does not throw
assert(NaN); // does not throw
assert(false); // does not throw
assert(null); // throws
assert(undefined); // throws

// Use assert.truthy to reject falsy values, such as 0 and ""
assert.truthy(count, "count must not be 0");

// Can also be used for custom checks
assert.truthy(count > 3, "count must be greater than 3");

// Custom error message can also be a function that will
// only be evaluated when the assertion fails
assert(user, () => generateExpensiveErrorMessage(user));
```

### API Reference

#### `assert`

**Type parameters**:

- `Value`: The type of the value being asserted

**Parameters**:

- `value` (`Value`): The value to assert is not `null` or `undefined`
- `errorMessage` (`ErrorMessage`, optional): Custom error message (`string`, `false`, or a function returning either). Defaults to `"Assertion failed: expected neither null nor undefined, but got …"`

**Returns**: `asserts value is NonNullable<Value>`

**Throws**: `TypeError` when `value` is `null` or `undefined`

#### `assert.truthy`

**Parameters**:

- `value` (`unknown`): The value to assert is truthy
- `errorMessage` (`ErrorMessage`, optional): Custom error message (`string`, `false`, or a function returning either). Defaults to `"Assertion failed: expected truthy value, but got …"`

**Returns**: `asserts value`

**Throws**: `TypeError` when `value` is falsy (`false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, or `NaN`)
