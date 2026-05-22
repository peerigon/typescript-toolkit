<p align="center">
  <h1>typescript-toolkit</h1>
  <strong>🔧✨ Tiny helpers for TypeScript applications</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@peerigon/typescript-toolkit"><img src="https://img.shields.io/npm/v/@peerigon/typescript-toolkit?style=for-the-badge" alt="Version on NPM" /></a>
  <a href="https://jsr.io/@peerigon/typescript-toolkit"><img src="https://img.shields.io/jsr/v/@peerigon/typescript-toolkit?style=for-the-badge" alt="Version on JSR" /></a>
  <a href="https://github.com/semantic-release/semantic-release"><img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=for-the-badge" alt="Semantically released" /></a>
  <a href="https://www.npmjs.com/package/@peerigon/typescript-toolkit"><img src="https://img.shields.io/npm/dm/@peerigon/typescript-toolkit?style=for-the-badge" alt="Monthly downloads on NPM" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/@peerigon/typescript-toolkit?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  Small, focused utilities you import one at a time — tree-shakeable ES modules with subpath exports.
</p>

## Features

- 🎯 High-quality module design
- ⚡ Lightweight sub-package exports
- 📦 Tree-shakeable ES modules

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

| Module                             | Description                                                                      | Docs                        |
| ---------------------------------- | -------------------------------------------------------------------------------- | --------------------------- |
| [`assert`](./src/assert/README.md) | Assert a value is not `null`, `undefined`, or `false`, with TypeScript narrowing | [→](./src/assert/README.md) |

## License

[MIT](./LICENSE)

## Sponsors

<p align="center">
  <a href="https://peerigon.com">
    <img src="https://assets.peerigon.com/peerigon/logo/peerigon-logo-flat-spinat.png" width="150" alt="Peerigon" />
  </a>
</p>
