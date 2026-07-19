<h1 align="center">typescript-toolkit</h1>
<p align="center"><strong>🔧✨ Tiny helpers for TypeScript applications</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@peerigon/typescript-toolkit"><img src="https://img.shields.io/npm/v/@peerigon/typescript-toolkit?style=for-the-badge" alt="Version on NPM" /></a>
  <a href="https://jsr.io/@peerigon/typescript-toolkit"><img src="https://img.shields.io/jsr/v/@peerigon/typescript-toolkit?style=for-the-badge" alt="Version on JSR" /></a>
  <a href="https://github.com/semantic-release/semantic-release"><img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=for-the-badge" alt="Semantically released" /></a>
  <a href="https://www.npmjs.com/package/@peerigon/typescript-toolkit"><img src="https://img.shields.io/npm/dm/@peerigon/typescript-toolkit?style=for-the-badge" alt="Monthly downloads on NPM" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/@peerigon/typescript-toolkit?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  Small, focused utilities you import one at a time.
</p>

## Features

- 🎯 High-quality module design
- ⚡ Lightweight sub-package exports
- 📦 Tree-shakeable ES modules
- ✅ Zero dependencies

## Installation

```sh
npm install @peerigon/typescript-toolkit --save
```

Also available on [JSR](https://jsr.io/@peerigon/typescript-toolkit).

## Usage

Import only the utilities you need. Each one is exposed as its own subpath:

```ts
import { assert } from "@peerigon/typescript-toolkit/assert";
```

## Utilities

| Module                                                           | Description                                                                      | Docs                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| [`assert`](./src/assert/README.md)                               | Assert a value is not `null` or `undefined`, with TypeScript narrowing           | [→](./src/assert/README.md)                |
| [`need`](./src/need/README.md)                                   | Assert a value is not `null` or `undefined` and return it with a narrowed type   | [→](./src/need/README.md)                  |
| [`dedupe`](./src/dedupe/README.md)                               | Remove duplicate values from an array while preserving first-occurrence order    | [→](./src/dedupe/README.md)                |
| [`emitter`](./src/emitter/README.md)                             | Minimal typed event emitter with payload objects per event                       | [→](./src/emitter/README.md)               |
| [`enums`](./src/enums/README.md)                                 | Lightweight string-enum alternative for `erasableSyntaxOnly` TypeScript projects | [→](./src/enums/README.md)                 |
| [`match`](./src/match/README.md)                                 | Exhaustive pattern matching with compile-time case checks, similar to `switch`   | [→](./src/match/README.md)                 |
| [`metadata`](./src/metadata/README.md)                           | Typed metadata attached to objects via per-channel WeakMap stores                | [→](./src/metadata/README.md)              |
| [`namespace`](./src/namespace/README.md)                         | Hierarchical namespaces with exclusive member claims and dotted prefixes         | [→](./src/namespace/README.md)             |
| [`result`](./src/result/README.md)                               | Type-safe error handling with pending, success, and error states                 | [→](./src/result/README.md)                |
| [`signals`](./src/signals/README.md)                             | Push-based reactive state with explicit watchers and `signal.from` adapters      | [→](./src/signals/README.md)               |
| [`sleep`](./src/sleep/README.md)                                 | Promise-based delay with optional `AbortSignal` cancellation                     | [→](./src/sleep/README.md)                 |
| [`stable-stringify`](./src/stable-stringify/README.md)           | Deterministic stringify for JSON + Map/Set/BigInt/Symbol/Date/RegExp             | [→](./src/stable-stringify/README.md)      |
| [`stable-stringify/json`](./src/stable-stringify/json/README.md) | JSON-only deterministic `JSON.stringify` with sorted object keys                 | [→](./src/stable-stringify/json/README.md) |
| [`unwrap`](./src/unwrap/README.md)                               | Extract values from `Result` or nullable types, with optional fallback support   | [→](./src/unwrap/README.md)                |

## License

[MIT](./LICENSE)

## Sponsors

<p align="center">
  <a href="https://peerigon.com">
    <img src="https://assets.peerigon.com/peerigon/logo/peerigon-logo-flat-spinat.png" width="150" alt="Peerigon" />
  </a>
</p>
