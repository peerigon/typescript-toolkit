## `result`

- 📦 Below 800 Bytes minified + compressed (brotli)
- ✅ Zero dependencies

Type-safe error handling using the [`Result` pattern](https://imhoff.blog/posts/using-results-in-typescript), eliminating the need for try-catch blocks.

Results can be in one of three states:

- **Pending**: Data is being loaded (with optional stale data)
- **Success**: Operation completed successfully with data
- **Error**: Operation failed with an error (and optional stale data)

For synchronous results that don't need a pending state, use `Result.Sync<T>` which is a union of just `Result.Success` and `Result.Error`.

### TanStack Query compatibility

The `Result` type is structurally aligned with [`@tanstack/query-core`](https://tanstack.com/query/latest) query observer results — the same `status`, `isPending`, `isSuccess`, `isError`, `data`, and `error` fields that `useQuery()` returns.

You can pass TanStack Query instances directly to functions typed with `Result`, without wrapping or mapping them. For example, a presentational React component can accept `Result<User>` as a prop and receive the return value of `useQuery()`:

```tsx
import { result, type Result } from "@peerigon/typescript-toolkit/result";
import { useQuery } from "@tanstack/react-query";

function UserCard({ user }: { user: Result<User> }) {
  return result(user).case({
    pending: () => <p>Loading…</p>,
    error: (error) => <p>{error.message}</p>,
    success: (data) => <p>{data.name}</p>,
    else: null,
  });
}

function UserPage({ id }: { id: string }) {
  const userQuery = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
  });

  return <UserCard user={userQuery} />;
}
```

### Basic result creation

```ts
import {
  isResult,
  result,
  type Result,
} from "@peerigon/typescript-toolkit/result";

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

### Handling result states

Handle each result state via `result().case()`:

```ts
const userHandle = result(userResult).case({
  pending: "Loading user...",
  success: (user) => `${user.name} (${user.email})`,
  error: (error) => `Failed: ${error.message}`,
  else: "Nothing to show",
});
```

### Wrapping functions with `result.from()`

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

### Async operations with `result.fromAsync()`

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

### Pending state for loading data

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

### Error results with stale data

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

### Type guard

Use `isResult()` to check if a value is a result:

```ts
if (isResult(value)) {
  // TypeScript knows value is Result<unknown>
  console.log(`Status: ${value.status}`);
  if (value.isSuccess) {
    console.log(`Data: ${value.data}`);
  }
}
```

### API Reference

#### `result.success(options)`

Creates a result in the success state.

```ts
result.success<const Data>(options: {
  data: Data;
  createdAt?: Date;
}): Result.Success<Data>
```

| Parameter           | Type              | Description                                |
| ------------------- | ----------------- | ------------------------------------------ |
| `options.data`      | `Data`            | Successful data                            |
| `options.createdAt` | `Date` (optional) | Creation timestamp (default: `new Date()`) |

**Returns:** `Result.Success<Data>`

#### `result.pending(options)`

Creates a result in the pending state.

```ts
result.pending<const Data = undefined>(options?: {
  data?: Data;
  createdAt?: Date;
}): Result.Pending<Data>
```

| Parameter           | Type              | Description                                |
| ------------------- | ----------------- | ------------------------------------------ |
| `options.data`      | `Data` (optional) | Stale data from a previous operation       |
| `options.createdAt` | `Date` (optional) | Creation timestamp (default: `new Date()`) |

**Returns:** `Result.Pending<Data>`

#### `result.error(options)`

Creates a result in the error state.

```ts
result.error<const GivenError extends Error, const Data = never>(options: {
  error: GivenError;
  data?: Data;
  createdAt?: Date;
}): Result.Error<GivenError, Data>
```

| Parameter           | Type              | Description                                |
| ------------------- | ----------------- | ------------------------------------------ |
| `options.error`     | `Error`           | Error that occurred                        |
| `options.data`      | `Data` (optional) | Stale data from a previous operation       |
| `options.createdAt` | `Date` (optional) | Creation timestamp (default: `new Date()`) |

**Returns:** `Result.Error<GivenError, Data>`

#### `result.from(fn)`

Executes a synchronous function and wraps its return value or thrown `Error`.

```ts
result.from<Data>(fn: () => Data): Result.Sync<Data>
```

| Parameter | Type         | Description                     |
| --------- | ------------ | ------------------------------- |
| `fn`      | `() => Data` | Synchronous function to execute |

**Returns:** `Result.Sync<Data>` — success when `fn` returns; error when `fn` throws an `Error`

**Note:** Only catches `Error` instances (from all realms). Other thrown values are re-thrown.

#### `result.fromAsync(fn)`

Executes an async function and wraps its resolved value or rejected `Error`.

```ts
result.fromAsync<Data>(fn: () => Promise<Data>): Promise<Result.Sync<Data>>
```

| Parameter | Type                  | Description               |
| --------- | --------------------- | ------------------------- |
| `fn`      | `() => Promise<Data>` | Async function to execute |

**Returns:** `Promise<Result.Sync<Data>>` — success when the promise resolves; error when it rejects with an `Error`

**Note:** Only catches `Error` instances (from all realms). Other rejection values are re-thrown.

#### `result(value).case(handlers)`

Matches a result with handlers per state (see [Handling result states](#handling-result-states)).

```ts
result<GivenResult extends Result | null | undefined>(
  givenResult: GivenResult,
): { case<ReturnType>(handlers: CaseHandlers): ReturnType }
```

| Parameter          | Type                                               | Description                                           |
| ------------------ | -------------------------------------------------- | ----------------------------------------------------- |
| `givenResult`      | `Result \| null \| undefined`                      | Result to match                                       |
| `handlers.pending` | `((data) => ReturnType) \| ReturnType` (optional)  | Pending state handler or value                        |
| `handlers.success` | `((data) => ReturnType) \| ReturnType` (optional)  | Success state handler or value                        |
| `handlers.error`   | `((error) => ReturnType) \| ReturnType` (optional) | Error state handler or value                          |
| `handlers.else`    | `((result) => ReturnType) \| ReturnType`           | Fallback for unmatched states, `null`, or `undefined` |

**Returns:** `ReturnType` — value from the first matching handler

#### `result.metadata(result)`

Reads non-enumerable metadata attached to a result instance.

```ts
result.metadata<Data>(result: Result<Data>): { createdAt: Date }
```

| Parameter | Type           | Description                                                             |
| --------- | -------------- | ----------------------------------------------------------------------- |
| `result`  | `Result<Data>` | Result created by `result.success`, `result.pending`, or `result.error` |

**Returns:** `{ createdAt: Date }`

#### `isResult(value)`

Type guard for `Result` instances.

```ts
isResult(value: unknown): value is Result
```

| Parameter | Type      | Description    |
| --------- | --------- | -------------- |
| `value`   | `unknown` | Value to check |

**Returns:** `boolean` — `true` when `value` is a `Result`

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

#### State properties

| Property    | Type                                | Description                            |
| ----------- | ----------------------------------- | -------------------------------------- |
| `status`    | `"pending" \| "success" \| "error"` | Current state                          |
| `isSuccess` | `boolean`                           | `true` only in success state           |
| `isError`   | `boolean`                           | `true` only in error state             |
| `isPending` | `boolean`                           | `true` only in pending state           |
| `data`      | varies by state                     | Payload or stale data                  |
| `error`     | `Error \| null`                     | Error in error state; `null` otherwise |
