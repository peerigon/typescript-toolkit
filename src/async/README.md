## `async`

Represents an async [`Result`](../result/README.md) that can be in one of three states:

- **pending**: Data is being loaded (optionally with stale data from previous results)
- **success**: Data has loaded successfully
- **error**: Loading failed (optionally with stale data from previous results)

It's inspired by [Elm's `RemoteData`](https://rametta.org/posts/elm-remote-data/) and designed to be compatible with [TanStack Query's](https://tanstack.com/query) `useQuery()` result, allowing you to use it seamlessly in your React applications (or other frontend frameworks that can work with TanStack Query).

Use [`Result`](../result/README.md) if you only need to represent success or error states without the pending state.

### Usage

```ts
import {
  async,
  isAsync,
  type Async,
} from "@peerigon/fractals-typescript/async";

// Create async states
const loading = async.pending();
const loadingWithStaleData = async.pending({ data: "stale data" });
const success = async.success({ data: "fresh data" });
const failed = async.error({ error: new Error("Network error") });
const failedWithStaleData = async.error({
  error: new Error("Network error"),
  data: "stale data",
});
```

#### Handling async states

Use the state properties to handle different async states:

```ts
function renderUser<User>(user: Async<User>) {
  if (user.isPending) {
    return "Loading...";
  }
  if (user.isError) {
    return `Error: ${user.error.message}`;
  }
  return `Data: ${user.data.name}`;
}
```

#### Pattern matching with status

Use the `status` property for exhaustive pattern matching:

```ts
import { match } from "@peerigon/fractals-typescript/match";

function handleAsync<T>(asyncData: Async<T>) {
  return match(asyncData.status).case({
    pending: () => "Loading...",
    success: () => `Success: ${asyncData.data}`,
    error: () => `Error: ${asyncData.error.message}`,
  });
}
```

#### TanStack Query compatibility

`Async` types are fully compatible with TanStack Query results:

```ts
import { useQuery } from "@tanstack/react-query";

function UserPage({ userId }: { userId: string }) {
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  return (
    <UserProfile
      // Pass the query result directly to an Async prop
      user={userQuery}
    />
  );
}

// This component doesn't know about TanStack Query
// but it can render the user in its different states.
function UserProfile({ user }: { user: Async<User> }) {
  if (user.isPending) {
    return "Loading...";
  }
  if (user.isError) {
    return `There was an error: ${user.error.message}`;
  }
  return `${user.data.name}`;
}
```

#### Type checking

Use `isAsync()` to check if a value is an async result:

```ts
function processValue(value: unknown) {
  if (isAsync(value)) {
    // TypeScript knows value is Async<unknown>
    console.log(`Status: ${value.status}`);
    console.log(`Is pending: ${value.isPending}`);
  }
}
```

### API Reference

#### `async.pending(options?)`

Creates an async result in the pending state.

**Parameters**:

- `options.data` (optional): Stale data from a previous result

**Returns**: `Async.Pending<Data>`

#### `async.success(options)`

Creates an async result in the success state.

**Parameters**:

- `options.data`: The successful data

**Returns**: `Async.Success<Data>`

#### `async.error(options)`

Creates an async result in the error state.

**Parameters**:

- `options.error`: The error that occurred
- `options.data` (optional): Stale data from a previous result

**Returns**: `Async.Error<GivenError, Data>`

#### `isAsync(value)`

Type guard to check if a value is an async result.

**Parameters**:

- `value`: The value to check

**Returns**: `boolean` - True if the value is an async result

### Type Reference

#### `Async<Data, Error>`

The main async type with three possible states:

```ts
type Async<Data, Error> =
  | Async.Pending<Data | undefined>
  | Async.Success<Data>
  | Async.Error<Error, Data | undefined>;
```

#### State Properties

All async states include these properties:

- `status`: `"pending" | "success" | "error"`
- `isSuccess`: `boolean` - True only for success state
- `isError`: `boolean` - True only for error state
- `isPending`: `boolean` - True only for pending state
- `data`: The data (type varies by state)
- `error`: The error (null for non-error states)

### ⚠️ Behavior Notes

- **Stale Data**: Pending and error states can optionally contain stale data from previous successful results
- **TanStack Compatibility**: Fully compatible with TanStack Query's `QueryObserverResult` types
- **Memory Efficient**: Uses prototypes to minimize memory footprint and keep debugger output clean
- **No Initial State**: Unlike Elm's `RemoteData` implementation, there's no "initial" state - use `Async | undefined` if needed
