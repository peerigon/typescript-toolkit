## `need(value, message?)`

✅ Zero dependencies

Assert that the given `value` is not `null` or `undefined` and return it with a narrowed type.

### Usage

```ts
import { need } from "@peerigon/fractals-typescript/need";

// Basic usage - throws if value is null or undefined
const userName: string | undefined = getUserName();
const safeUserName: string = need(userName); // Type is now string, not string | undefined

// With custom error message
const safeConfig = need(config, "Configuration is required but not found");

// Working with optional properties
type User = {
  id: string;
  email?: string;
};

const user: User = getUser();
const email: string = need(
  user.email,
  "User email is required for this operation",
);
```

### Error Handling

The function throws a `TypeError` when the value is `null` or `undefined`:

```ts
// Default error messages
need(null); // TypeError: Expected value to be defined, but got null
need(undefined); // TypeError: Expected value to be defined, but got undefined

// Custom error message
need(null, "Value cannot be empty"); // TypeError: Value cannot be empty
```

### API Reference

**Type parameters**:

- `Value`: The type of the input value

**Parameters**:

- `value` (`Value`): The value to check for null or undefined.
- `message` (`string`, optional): Custom error message. Defaults to `"Expected value to be defined, but got ${value}"`.

**Returns**: `NonNullable<Value>` - The same value with `null` and `undefined` removed from the type.

**Throws**: `TypeError` if the value is `null` or `undefined`.

### ⚠️ When to Use

Use `need()` when:

- You expect a value to be defined but the type system can't guarantee it
- You want to fail fast with a clear error message when required data is missing
- You need to narrow types from nullable to non-nullable
- You're working with external APIs that might return nullable values

**Don't use `need()` when**:

- You can handle the null/undefined case gracefully with conditional logic
- The nullable state is part of normal program flow (use optional chaining or conditional checks instead)
