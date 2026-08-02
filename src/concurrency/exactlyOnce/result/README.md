## `concurrency/exactlyOnce/result`

- 📦 Below **1.08 kB** minified + compressed (brotli)
- ✅ Zero dependencies

Like [`exactlyOnce`](../README.md), but also exposes a synchronous `Result` snapshot on `.result`. Import this subpath so the base `/concurrency/exactlyOnce` entry stays free of the `result` dependency.

### Basic usage

```ts
import { exactlyOnce } from "@peerigon/typescript-toolkit/concurrency/exactlyOnce/result";

const initialize = exactlyOnce(async (config: Config) => {
  return setup(config);
});

await initialize(config);
initialize.result?.isSuccess; // true
```

### Result snapshot

- `result` — synchronous `Result<Data> | undefined` snapshot (`undefined` = never called)
- `promise` — passive promise that resolves when something else triggers a successful call

### API Reference

#### `exactlyOnce(fn)`

```ts
exactlyOnce<Args, Data>(
  fn: (...args: Args) => Promise<Data>,
): ExactlyOnceWithResult<Args, Data>
```

Same arguments as the base [`exactlyOnce`](../README.md). Returns a callable with `result` and `promise` properties.
