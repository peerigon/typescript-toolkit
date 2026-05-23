## `need`

- 📦 Below 150 Bytes
- ✅ Zero dependencies

Assert that the given `value` is not `null` or `undefined` and return it with a narrowed type.

### Usage

```ts
import { need } from "@peerigon/typescript-toolkit/need";

// Call need() to remove undefined | null from the type
// Throws a TypeError at runtime if the value is null or undefined.
const safeUserName: string = need(userName);

// With custom error message
const safeConfig = need(config, "Configuration is required but not found");

// Custom error messages just for the development build. Production builds will remove the message. In that case, a generic default error message is used.
const safeConfig = need(
  config,
  import.meta.env.DEV && "Minifiers will remove this message for prod",
);

// Custom error message can also be a function that will
// only be evaluated when the error is thrown
const safeConfig = need(
  config,
  () => "This is an expensive message to generate",
);
```

### API Reference

**Type parameters**:

- `Value`: The type of the input value

**Parameters**:

- `value` (`Value`): The value to check for null or undefined.
- `message` (`string`, optional): Custom error message. Defaults to `"Expected value to be defined, but got ${value}"`.

**Returns**: `NonNullable<Value>` - The same value with `null` and `undefined` removed from the type.

**Throws**: `TypeError` if the value is `null` or `undefined`.
