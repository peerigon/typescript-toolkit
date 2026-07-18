## `sleep`

- 📦 Below **175 B** minified + compressed (brotli)
- ✅ Zero dependencies

Promise-based delay with optional `AbortSignal` cancellation.

### Basic usage

```ts
import { sleep } from "@peerigon/typescript-toolkit/sleep";

await sleep(1000);

// Second argument is an optional AbortSignal to cancel the wait
// See "Cancelable sleep" below
await sleep(1000, AbortSignal.timeout(2000));
```

### Cancelable sleep

```ts
// Retry with backoff — stop waiting if the caller aborts
async function fetchWithRetry(url: string, signal: AbortSignal) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(url, { signal });
    } catch (error) {
      if (signal.aborted) throw error;
      await sleep(1000 * 2 ** attempt, signal);
    }
  }
}
```

### API Reference

#### `sleep(ms, signal?)`

```ts
sleep(ms: number, signal?: AbortSignal): Promise<void>
```

| Parameter | Type          | Description                        |
| --------- | ------------- | ---------------------------------- |
| `ms`      | `number`      | Delay in milliseconds              |
| `signal`  | `AbortSignal` | Optional signal to cancel the wait |

**Returns:** `Promise<void>` that resolves after `ms`, or rejects when aborted
