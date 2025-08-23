## `reject`

- 📦 Below 100 Bytes
- ✅ Zero dependencies

Returns a function that throws the given error.

### Usage

```ts
import { reject } from "@peerigon/fractals-typescript/reject";

// Create a function that throws a copy of an existing error
const throwError = reject(new Error("Something went wrong"));

// When called, throws a copy of the original error with correct stack trace
throwError(); // Error: Something went wrong
```

#### Passing a function

You can also pass a function that creates a new error instance:

```ts
const throwError = reject(() => new Error("Custom error message"));
```

### API Reference

**Parameters**:

- `error` (`Error | (() => Error)`): Either an existing Error object or a function that returns a new Error instance.

**Returns**: `() => never` - A function that throws the error when called.

### Stack Trace Behavior

The returned function uses `Error.captureStackTrace()` to ensure that the stack trace points to where the function is called, not where the error was created. This provides more useful debugging information:

```ts
const error = new Error("test");
const throwError = reject(error);

function someFunction() {
  throwError(); // Stack trace will show this line, not the reject() call
}

someFunction();
```

### ⚠️ Important Notes

- When passing an Error object, a copy is made using `Object.create()`
- When passing a function, no copy is made - the function is called each time the returned function is invoked
- The returned function always throws and never returns a value (return type is `never`)
