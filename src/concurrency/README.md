## `concurrency`

Helpers that restrict how often and how concurrently async functions run. Each helper is its own subpath export so you only pull in what you use. `Result` versions are optional via nested `/result` exports.

| Module                                                             | Description                                                |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| [`concurrency/once`](./once/README.md)                             | Run an async function at most once (single-flight + cache) |
| [`concurrency/once/result`](./once/result/README.md)               | `once` with a synchronous `Result` snapshot                |
| [`concurrency/exactlyOnce`](./exactlyOnce/README.md)               | Invoke an async function exactly once; second call throws  |
| [`concurrency/exactlyOnce/result`](./exactlyOnce/result/README.md) | `exactlyOnce` with a synchronous `Result` snapshot         |
| [`concurrency/mutex`](./mutex/README.md)                           | Serialize async tasks (concurrency 1)                      |
| [`concurrency/rate-limit`](./rate-limit/README.md)                 | Pace async task starts (`max` per sliding `interval`)      |
