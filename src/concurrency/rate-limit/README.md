## `concurrency/rate-limit`

- 📦 Below **400 B** minified + compressed (brotli)
- ✅ Zero dependencies

Schedule async tasks so at most `max` start within any sliding `interval` window.

### Basic usage

```ts
import { rateLimit } from "@peerigon/typescript-toolkit/concurrency/rate-limit";

const limit = rateLimit({ max: 10, interval: 1000 });

await limit(async () => doWork());
await limit(async () => doMoreWork());
```

Admission is serialized; tasks may still run concurrently after they are admitted.
Pass an optional `AbortSignal` as the second argument to cancel while waiting for
admission (the aborted call does not consume a rate-limit slot).

### API Reference

#### `rateLimit(options)`

```ts
rateLimit(options: { max: number; interval: number }):
  <Data>(task: () => Promise<Data>, signal?: AbortSignal) => Promise<Data>
```

| Option     | Type     | Description                                    |
| ---------- | -------- | ---------------------------------------------- |
| `max`      | `number` | Max task starts per sliding window (`>= 1`)    |
| `interval` | `number` | Sliding window length in milliseconds (`>= 1`) |
