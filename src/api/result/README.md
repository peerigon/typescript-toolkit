## `api/result`

- 📦 Below **1.4 kB** minified + compressed (brotli)
- ✅ Zero dependencies

`defineApi` that returns `Result.Sync` instead of throwing. Import this subpath so the base `/api` entry stays free of the `result` dependency.

### Basic usage

```ts
import { defineApiResult } from "@peerigon/typescript-toolkit/api/result";

const api = defineApiResult("https://api.example.com");

const outcome = await api({ url: "/users/1", method: "GET" });

if (outcome.isSuccess) {
  console.log(outcome.data);
} else {
  console.log(outcome.error.message);
}
```

Accepts the same arguments as [`defineApi`](../README.md). Failures from the HTTP pipeline (`FetchError`, network errors, JSON parse errors) become `Result.Error`.

### API Reference

#### `defineApiResult(baseUrl, options?)`

```ts
defineApiResult(baseUrl: string, options?: DefineApiOptions):
  (input: FetchInput) => Promise<Result.Sync>
```

Thin wrapper: `result.fromAsync(() => defineApi(baseUrl, options)(input))`.
