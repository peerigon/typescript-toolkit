## `concurrency/exactlyOnce`

- 📦 Below **230 B** minified + compressed (brotli)
- ✅ Zero dependencies

Wrap an async function so it may be called exactly once. A second call throws synchronously. Failures are terminal — no retry.

For a synchronous [`Result`](../../result/README.md) snapshot, use [`concurrency/exactlyOnce/result`](./result/README.md).

### Basic usage

```ts
import { exactlyOnce } from "@peerigon/typescript-toolkit/concurrency/exactlyOnce";

const initialize = exactlyOnce(async (config: Config) => {
  return setup(config);
});

await initialize(config);
initialize(); // throws Error: Function was already invoked
```

### API Reference

#### `exactlyOnce(fn)`

```ts
exactlyOnce<Args, Data>(
  fn: (...args: Args) => Promise<Data>,
): ExactlyOnce<Args, Data>
```

| Parameter | Type                               | Description                      |
| --------- | ---------------------------------- | -------------------------------- |
| `fn`      | `(...args: Args) => Promise<Data>` | Async function that may run once |

**Returns:** Callable with a `promise` property.

**Throws:** `Error` synchronously when called a second time.
