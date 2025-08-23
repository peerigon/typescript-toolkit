## `assert`

- 📦 Below 200 Bytes
- ✅ Zero dependencies

Assert that a given `value` is not `null`, `undefined`, or `false`, and narrow its type. This function provides both runtime validation and TypeScript type narrowing.

Unlike regular truthiness checks, `assert` only rejects `null`, `undefined`, and `false` while allowing other falsy values like `0`, `""`, and `NaN` to pass through. Use `assert.truthy` if you need to check for truthiness.

### Usage

```ts
import { assert } from "@peerigon/fractals-typescript/assert";

function processUser(user: User | null) {
  assert(user); // Throws if user is null
  // TypeScript now knows user is User, not User | null
  console.log(user.name); // No type error
}
```

#### Type narrowing

The primary benefit of `assert` is TypeScript type narrowing. After calling `assert`, TypeScript eliminates `null`, `undefined`, and `false` from the value's type:

```ts
let maybeString: string | null | undefined = getValue();
assert(maybeString);
// TypeScript now knows maybeString is string
const length = maybeString.length; // No type error
```

#### Custom error messages

You can provide a custom error message for more descriptive failures:

```ts
assert(user, "User must be logged in to access this feature");
// Throws: "User must be logged in to access this feature"
```

#### Expensive error messages

You can pass a function that returns the error message, useful for expensive message generation:

```ts
assert(user, () => generateExpensiveErrorMessage(user));
// Only evaluates the function if assertion fails
```

#### Removing error messages in production builds

`assert` allows to pass `false` as message. In this case, the default error message is shown:

```ts
assert(
  user,
  // Vite replaces `import.meta.env.DEV` with `false` in production builds.
  // Minifiers will then just discard the second && operand as it can't change
  // the expression result.
  import.meta.env.DEV &&
    "Some lengthy debugging message that should not leak into the production build",
);
```

#### Handling falsy values

`assert` distinguishes between "nullish" values (`null`, `undefined`) and other falsy values:

```ts
assert(0); // ✅ Does not throw (0 is falsy but not nullish)
assert(""); // ✅ Does not throw (empty string is falsy but not nullish)
assert(NaN); // ✅ Does not throw (NaN is falsy but not nullish)
assert(false); // ❌ Throws (false is explicitly rejected)
assert(null); // ❌ Throws (null is nullish)
assert(undefined); // ❌ Throws (undefined is nullish)
```

### Truthy checks

Use `assert.truthy` to perform truthyness checks:

```ts
function processCount(count: number) {
  assert.truthy(count, "count must not be 0"); // Throws if count is 0
  console.log(100 / count); // No division by zero concern
}
```

### API Reference

**Type parameters**:

- `Value`: The type of the value being asserted

**Parameters**:

- `value` (`Value`): The value to assert as non-nullish
- `message` (`string`, optional): Custom error message. Defaults to `"Assertion failed on ${String(value)}"`

**Returns**: `asserts value is NonNullable<Value> & Exclude<Value, false>`

**Throws**: `TypeError` when `value` is `null`, `undefined`, or `false`

### ⚠️ Behavior Notes

- **Error Type**: Always throws `TypeError` instances, not generic `Error`
- **Falsy Tolerance**: Allows falsy values like `0`, `""`, and `NaN` to pass through, focusing only on nullish values and `false`
