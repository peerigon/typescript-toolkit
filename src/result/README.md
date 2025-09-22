## `result`

- 📦 Below 600 Bytes
- ✅ Zero dependencies

Type-safe error handling using the [`Result` pattern](https://imhoff.blog/posts/using-results-in-typescript), eliminating the need for try-catch blocks.

Results can be in one of three states:

- **Pending**: Data is being loaded (with optional stale data)
- **Success**: Operation completed successfully with data
- **Error**: Operation failed with an error (and optional stale data)

For synchronous results that don't need a pending state, use `Result.Sync<T>` which is a union of just `Result.Success` and `Result.Error`.

### Usage

#### Basic result creation

```ts
import {
  isResult,
  result,
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

#### Unwrapping results

You can unwrap results via `result().unwrap()` while handling different states:

```ts
const userHandle = result(userResult).unwrap({
  pending: "Loading user...",
  success: (user) => `${user.name} (${user.email})`,
  error: (error) => `Failed: ${error.message}`,
  else: "Nothing to show",
});
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

#### Pending state for loading data

Create results in a pending state while data is being loaded:

```ts
// Create pending result without data
const loadingResult = result.pending();
console.log(loadingResult.isPending); // true
console.log(loadingResult.data); // undefined

// Create pending result with stale data from previous load
loadingResult = result.pending({ data: "stale data" });
console.log(loadingResult.isPending); // true
console.log(loadingResult.data); // "stale data"
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

#### `result.pending(options)`

Creates a result in the pending state.

**Parameters**:

- `options.data` (optional): Stale data from a previous operation

**Returns**: `Result.Pending<Data>`

#### `result.error(options)`

Creates a result in the error state.

**Parameters**:

- `options.error`: The error that occurred
- `options.data` (optional): Stale data from a previous operation

**Returns**: `Result.Error<GivenError, Data>`

#### `result.from(fn)`

Executes a function and wraps the result or error in a `Result.Sync` type (without pending state).

**Parameters**:

- `fn`: Function to execute (must be synchronous)

**Returns**: `Result.Sync<Data>` - Success if function returns, Error if function throws an Error

**Note**: Only catches Error instances (from all realms). Other thrown values are re-thrown.

#### `result.fromAsync(fn)`

Executes an async function and wraps the resolved value or rejection in a `Result.Sync` type (without pending state).

**Parameters**:

- `fn`: Async function to execute

**Returns**: `Promise<Result.Sync<Data>>` - Success if promise resolves, Error if promise rejects with an Error

**Note**: Only catches Error instances (from all realms). Other rejection values are re-thrown.

#### `result(value).unwrap(handlers)`

Unwraps a result by providing handlers for different states. This provides a type-safe way to extract values from results without manual status checking.

**Parameters**:

- `value`: The result to unwrap (can also be `null` or `undefined`)
- `handlers`: Object containing handler functions or values for each state:
  - `pending` (optional): Handler for pending state - receives `data` parameter
  - `success` (optional): Handler for success state - receives `data` parameter
  - `error` (optional): Handler for error state - receives `error` parameter
  - `else` (required): Fallback handler for unmatched states or null/undefined values

**Returns**: The value returned by the matched handler

**Usage Examples**:

```ts
const apiResult = result.success({ data: { name: "Alice", age: 30 } });

// Using function handlers
const message = result(apiResult).unwrap({
  success: (data) => `Hello, ${data.name}!`,
  error: (error) => `Failed: ${error.message}`,
  else: "Unknown state",
});
console.log(message); // "Hello, Alice!"

// Using direct values
const status = result(apiResult).unwrap({
  success: "loaded",
  error: "failed",
  else: "unknown",
});
console.log(status); // "loaded"

// Handling null/undefined
const response = result(null).unwrap({
  success: (data) => data,
  else: "No result available",
});
console.log(response); // "No result available"
```

#### `isResult(value)`

Type guard to check if a value is a Result.

**Parameters**:

- `value`: The value to check

**Returns**: `boolean` - True if the value is a Result

### Type Reference

#### `Result<Data, Error>`

The main result type with three possible states:

```ts
type Result<Data, Error> =
  | Result.Pending<Data>
  | Result.Success<Data>
  | Result.Error<Error, Data>;
```

#### `Result.Sync<Data, Error>`

A synchronous result type with only two states (no pending):

```ts
type Result.Sync<Data, Error> = Result.Success<Data> | Result.Error<Error, Data>;
```

#### State Properties

All result states include these properties:

- `status`: `"pending" | "success" | "error"`
- `isSuccess`: `boolean` - True only for success state
- `isError`: `boolean` - True only for error state
- `isPending`: `boolean` - True only for pending state
- `data`: The data (type varies by state)
- `error`: The error (null for success and pending states)

### ⚠️ Behavior Notes

- **Error Filtering**: `result.from()` and `result.fromAsync()` only catch Error instances, not arbitrary thrown values
- **Stale Data**: Error results can contain stale data from previous operations
- **Type Safety**: Result types make error states explicit and provide type-safe access to data
- **Memory Efficient**: Uses prototypes to minimize memory footprint and keep debugger output clean
- **No Exception Handling**: Eliminates the need for try-catch blocks in favor of explicit error handling
- **Composability**: Results can be easily chained and composed with other functional patterns
