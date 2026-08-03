## `api/rate-limit`

- 📦 Below **675 B** minified + compressed (brotli)
- ✅ Zero dependencies

Build a rate-limited `fetch` for [`defineApi`](../README.md). Paces requests and retries common rate-limit responses (`429`, or `503` with `Retry-After`). Caller `AbortSignal` cancels admission waits and retry delays.

### Basic usage

```ts
import { defineApi } from "@peerigon/typescript-toolkit/api";
import { defineLimitedFetch } from "@peerigon/typescript-toolkit/api/rate-limit";

const api = defineApi("https://api.example.com", {
  fetch: defineLimitedFetch({ max: 10, interval: 1000 }),
});
```

### Custom fetch

```ts
defineLimitedFetch({
  max: 5,
  interval: 1000,
  maxRetries: 2,
  fetch: async (url, init) => {
    console.log("request", url);
    return globalThis.fetch(url, init);
  },
});
```

### API Reference

#### `defineLimitedFetch(options)`

```ts
defineLimitedFetch(options: DefineLimitedFetchOptions): typeof fetch
```

| Option       | Type           | Description                                       |
| ------------ | -------------- | ------------------------------------------------- |
| `max`        | `number`       | Max request starts per sliding window             |
| `interval`   | `number`       | Sliding window in ms; also fallback retry delay   |
| `fetch`      | `typeof fetch` | Underlying fetch (default: `globalThis.fetch`)    |
| `maxRetries` | `number`       | Retries after rate-limit responses (default: `3`) |

Also exported: `parseRetryAfter(value, now?)` for `Retry-After` parsing.
