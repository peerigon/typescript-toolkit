## `concurrency/mutex`

- 📦 Below **90 B** minified + compressed (brotli)
- ✅ Zero dependencies

Create a mutex that runs handed-off tasks one at a time. Unlike [`once`](../once/README.md), every task runs — they are just serialized.

### Basic usage

```ts
import { mutex } from "@peerigon/typescript-toolkit/concurrency/mutex";

const lock = mutex();

await lock(async () => writeToDisk(data));
await lock(async () => writeToDisk(moreData));
```

### API Reference

#### `mutex()`

```ts
mutex(): <Data>(task: () => Promise<Data>) => Promise<Data>
```

**Returns:** A function that serializes tasks with concurrency 1.
