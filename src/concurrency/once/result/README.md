## `concurrency/once/result`

- 📦 Below **1.05 kB** minified + compressed (brotli)
- ✅ Zero dependencies

Like [`once`](../README.md), but also exposes a synchronous `Result` snapshot on `.result`. Import this subpath so the base `/concurrency/once` entry stays free of the `result` dependency.

### Basic usage

```ts
import { once } from "@peerigon/typescript-toolkit/concurrency/once/result";

const loadSession = once(async () => {
  const response = await fetch("/api/session");
  return response.json();
});

await loadSession();
loadSession.result?.isSuccess; // true
await loadSession.promise;
```

### Result snapshot

- `result` — synchronous `Result<Data> | undefined` snapshot (`undefined` = never called)
- `promise` — passive promise that resolves when something else triggers a successful call

### API Reference

#### `once(fn)`

```ts
once<Data>(fn: () => Promise<Data>): OnceWithResult<Data>
```

Same arguments as the base [`once`](../README.md). Returns a callable with `result` and `promise` properties.
