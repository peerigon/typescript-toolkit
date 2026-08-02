## `concurrency/once`

- 📦 Below **200 B** minified + compressed (brotli)
- ✅ Zero dependencies

Wrap a zero-argument async function so it runs at most once. Concurrent callers share the same in-flight promise; successful results are cached. Rejections are not cached, so the next call retries.

For a synchronous [`Result`](../../result/README.md) snapshot, use [`concurrency/once/result`](./result/README.md).

### Basic usage

```ts
import { once } from "@peerigon/typescript-toolkit/concurrency/once";

const loadSession = once(async () => {
  const response = await fetch("/api/session");
  return response.json();
});

await loadSession();
await loadSession.promise; // passive waiters resolve without calling again
```

### API Reference

#### `once(fn)`

```ts
once<Data>(fn: () => Promise<Data>): Once<Data>
```

| Parameter | Type                  | Description                        |
| --------- | --------------------- | ---------------------------------- |
| `fn`      | `() => Promise<Data>` | Async function to run at most once |

**Returns:** Callable with a `promise` property.
