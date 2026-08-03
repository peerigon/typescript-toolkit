## `api`

- 📦 Below **575 Bytes** minified + compressed (brotli)
- ✅ Zero dependencies

Define a typed JSON API client with a fixed hook pipeline: `init` → `fetch` → `error` → `success`. Omit hooks to get JSON-API defaults; override any stage (especially `fetch` in tests).

### Basic usage

```ts
import { defineApi } from "@peerigon/typescript-toolkit/api";

const api = defineApi("https://api.example.com");

const user = await api({
  url: "/users/1",
  method: "GET",
});
```

### Request input

```ts
await api({
  url: "/users", // must start with /
  method: "POST",
  query: { page: "1" }, // URLSearchParams or constructor params
  body: { name: "Ada" }, // JSON-serialized
  signal: AbortSignal.timeout(5_000),
});
```

### Hook pipeline

| Hook      | Sync/async | Arguments            | Default behavior                                             |
| --------- | ---------- | -------------------- | ------------------------------------------------------------ |
| `init`    | sync       | `FetchInput`         | Join `baseUrl` + path + query, apply headers, stringify body |
| `fetch`   | async      | `url`, `RequestInit` | `globalThis.fetch`                                           |
| `error`   | async      | `Response`           | Throw `FetchError` when `!response.ok`                       |
| `success` | async      | `Response`           | `response.json()`                                            |

`baseUrl` is applied by the default `init`. A custom `init` owns URL and header construction.

```ts
const api = defineApi("https://api.example.com", {
  init: (input) => ({
    url: `https://api.example.com${input.url}`,
    method: input.method,
    headers: new Headers(),
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
    signal: input.signal,
  }),
  fetch: globalThis.fetch,
  error: async (response) => {
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  },
  success: async (response) => response.json(),
});
```

### Intercepting in tests

Override the `fetch` hook. It matches the native `fetch(url, init)` signature, so you can call through to `defaultFetch` (alias of `globalThis.fetch`):

```ts
import { defaultFetch, defineApi } from "@peerigon/typescript-toolkit/api";

const api = defineApi("https://api.example.com", {
  fetch: async (url, init) => {
    if (process.env.IS_TESTING === "true") {
      return Response.json({ source: "mock" });
    }
    return defaultFetch(url, init);
  },
});
```

### Custom headers

`FetchInput` has no `headers` field. Pass them as the second argument to `defaultInit` when overriding `init`:

```ts
import { defaultInit, defineApi } from "@peerigon/typescript-toolkit/api";

const baseUrl = "https://api.example.com";

const api = defineApi(baseUrl, {
  init: defaultInit(baseUrl, (input) => ({
    Authorization: `Bearer ${getToken()}`,
    "X-Request-Path": input.url,
  })),
});
```

When `body` is set, `Content-Type: application/json` is added unless already present.

### API Reference

#### `defineApi(baseUrl, options?)`

```ts
defineApi(baseUrl: string, options?: DefineApiOptions):
  (input: FetchInput) => Promise<unknown>
```

| Parameter | Type               | Description                                     |
| --------- | ------------------ | ----------------------------------------------- |
| `baseUrl` | `string`           | Prefixed onto `input.url` (default `init` only) |
| `options` | `DefineApiOptions` | Optional hook overrides                         |

| Option    | Type                                            | Description              |
| --------- | ----------------------------------------------- | ------------------------ |
| `init`    | `(input: FetchInput) => FetchOptions`           | Build request options    |
| `fetch`   | `typeof globalThis.fetch`                       | Execute the request      |
| `error`   | `(response: Response) => void \| Promise<void>` | Throw on failure         |
| `success` | `(response: Response) => Promise<unknown>`      | Decode the response body |

Also exported: `defaultInit`, `defaultFetch`, `defaultError`, `defaultSuccess`, `FetchError`, and related types.

### ⚠️ Behavior Notes

- **Empty / `204` responses**: Default `success` calls `response.json()`, which fails on empty bodies — override `success` when you need that
- **Error body**: Default `error` does not consume the response body; read it in a custom `error` or `success` hook if needed
- **Custom `init`**: Ignores `baseUrl` — pass it into your own `init` / `defaultInit` if needed
- **Return type**: Always `Promise<unknown>` — narrow per call site as needed

### Result variant

For `Result.Sync` instead of throws, use [`api/result`](./result/README.md):

```ts
import { defineApiResult } from "@peerigon/typescript-toolkit/api/result";
```

### Rate limiting

For paced requests and `Retry-After` retries, use [`api/rate-limit`](./rate-limit/README.md):

```ts
import { defineLimitedFetch } from "@peerigon/typescript-toolkit/api/rate-limit";

const api = defineApi("https://api.example.com", {
  fetch: defineLimitedFetch({ max: 10, interval: 1000 }),
});
```
