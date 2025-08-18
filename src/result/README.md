## `result`

Type-safe error handling using the [`Result` pattern](https://imhoff.blog/posts/using-results-in-typescript), eliminating the need for try-catch blocks. Results can be either successful (with `data`) or failed (with an `error`), making error states explicit in the type system.

A key feature of this implementation is its compatibility with [tanstack query](https://tanstack.com/query). The return type of `useQuery` is compatible with `Result`, allowing you to use the result pattern seamlessly in your React applications (or other frontend frameworks that can work with tanstack query).

### Usage

#### Basic result creation

```ts
import {
  result,
  isResult,
  type Result,
} from "@peerigon/fractals-typescript/result";

let result: Result<string>;

// Create a successful result
result = result.success({ data: "Hello, world!" });
console.log(result.isSuccess); // true
console.log(result.data); // "Hello, world!"

// ...or create an error result
result = result.error({ error: new Error("Something went wrong") });
console.log(result.isError); // true
console.log(result.error.message); // "Something went wrong"
```

#### Wrapping functions with `result.from()`

Convert throwing functions into result-returning functions:

```ts
const parseJson = <Json>(jsonString: string): Result<Json> => {
  return result.from(() => JSON.parse(jsonString));
};

type User = {
  name: string;
};

// Use safely without try-catch
const validJson = parseJson<User>('{"name": "Alice"}');
if (validJson.isSuccess) {
  console.log(validJson.data.name); // "Alice"
}

const invalidJson = parseJson<User>("invalid json");
if (invalidJson.isError) {
  console.log(invalidJson.error.message); // "Unexpected token..."
}
```

#### Async operations with `result.fromAsync()`

Handle async operations that might reject:

```ts
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("User not found");
  return response.json();
}

// Handle async results
const fetchUserResult = await result.fromAsync(() => fetchUser(id));
if (fetchUserResult.isSuccess) {
  console.log(`User: ${fetchUserResult.data.name}`);
} else {
  console.log(`Error: ${fetchUserResult.error.message}`);
}
```

#### Pattern matching with status

```ts
import { match } from "@peerigon/fractals-typescript/match";

function handleResult<T>(result: Result<T>) {
  return match(result.status).case({
    success: () => `Data: ${result.data}`,
    error: () => `Error: ${result.error.message}`,
  });
}
```

#### Error results with stale data

Error results can optionally contain stale `data` from previous operations:

```ts
const errorWithStaleData = result.error({
  error: new Error("Network timeout"),
  data: "cached data from previous request",
});

if (errorWithStaleData.isError) {
  console.log(errorWithStaleData.error.message); // "Network timeout"
  console.log(errorWithStaleData.data); // "cached data from previous request"
}
```

#### Type guard

Use `isResult()` to check if a value is a result:

```ts
function processValue(value: unknown) {
  if (isResult(value)) {
    // TypeScript knows value is Result<unknown>
    console.log(`Status: ${value.status}`);
    if (value.isSuccess) {
      console.log(`Data: ${value.data}`);
    }
  }
}
```

### API Reference

#### `result.success(options)`

Creates a result in the success state.

**Parameters**:

- `options.data`: The successful data

**Returns**: `Result.Success<Data>`

#### `result.error(options)`

Creates a result in the error state.

**Parameters**:

- `options.error`: The error that occurred
- `options.data` (optional): Stale data from a previous operation

**Returns**: `Result.Error<GivenError, Data>`

#### `result.from(fn)`

Executes a function and wraps the result or error in a Result type.

**Parameters**:

- `fn`: Function to execute (must be synchronous)

**Returns**: `Result<Data>` - Success if function returns, Error if function throws an Error

**Note**: Only catches Error instances (from all realms). Other thrown values are re-thrown.

#### `result.fromAsync(fn)`

Executes an async function and wraps the resolved value or rejection in a Result type.

**Parameters**:

- `fn`: Async function to execute

**Returns**: `Promise<Result<Data>>` - Success if promise resolves, Error if promise rejects with an Error

**Note**: Only catches Error instances (from all realms). Other rejection values are re-thrown.

#### `isResult(value)`

Type guard to check if a value is a Result.

**Parameters**:

- `value`: The value to check

**Returns**: `boolean` - True if the value is a Result

### Type Reference

#### `Result<Data, Error>`

The main result type with two possible states:

```ts
type Result<Data, Error> = Result.Success<Data> | Result.Error<Error, Data>;
```

#### State Properties

All result states include these properties:

- `status`: `"success" | "error"`
- `isSuccess`: `boolean` - True only for success state
- `isError`: `boolean` - True only for error state
- `data`: The data (type varies by state)
- `error`: The error (null for success state)

### ⚠️ Behavior Notes

- **Error Filtering**: `result.from()` and `result.fromAsync()` only catch Error instances, not arbitrary thrown values
- **Stale Data**: Error results can contain stale data from previous operations
- **Type Safety**: Result types make error states explicit and provide type-safe access to data
- **Memory Efficient**: Uses prototypes to minimize memory footprint and keep debugger output clean
- **No Exception Handling**: Eliminates the need for try-catch blocks in favor of explicit error handling
- **Composability**: Results can be easily chained and composed with other functional patterns
