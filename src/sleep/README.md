## `sleep`

- 📦 Below **175 B** minified + compressed (brotli)
- ✅ Zero dependencies

Promise-based delay with optional `AbortSignal` cancellation.

### Basic usage

```ts
import { sleep } from "@peerigon/typescript-toolkit/sleep";

await sleep(1000);

const controller = new AbortController();
await sleep(5000, controller.signal);
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
