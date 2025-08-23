# Fractals/TypeScript

**📦✨ Tiny helpers for TypeScript applications**

[![Version on NPM](https://img.shields.io/npm/v/@peerigon/fractals-typescript?style=for-the-badge)](https://www.npmjs.com/package/@peerigon/fractals-typescript)
[![Version on JSR](https://img.shields.io/jsr/v/@peerigon/fractals-typescript?style=for-the-badge)](https://jsr.io/@peerigon/fractals-typescript)
[![Semantically released](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=for-the-badge)](https://github.com/semantic-release/semantic-release)
[![Monthly downloads on NPM](https://img.shields.io/npm/dm/@peerigon/fractals-typescript?style=for-the-badge)](https://www.npmjs.com/package/@peerigon/fractals-typescript)<br>
[![License](https://img.shields.io/npm/l/@peerigon/fractals-typescript?style=for-the-badge)](./LICENSE)

## Features

- 🎯 High quality module design
- ⚡ Lightweight because of sub-package exports
- 📦 Tree-shakeable ES modules

## Installation

```sh
npm install @peerigon/fractals-typescript  --save
```

## Usage

Each utility is available as a sub-package import:

```ts
import { assert } from "@peerigon/fractals-typescript/assert";
import { match } from "@peerigon/fractals-typescript/match";
import { result } from "@peerigon/fractals-typescript/result";
// ... and more
```

## Available Utilities

### `assert`

Assert that a given value is not `null`, `undefined`, or `false`, and narrow its type. This function provides both runtime validation and TypeScript type narrowing.

```ts
import { assert } from "@peerigon/fractals-typescript/assert";

function processUser(user: User | null) {
  assert(user); // Throws if user is null
  console.log(user.name); // TypeScript knows user is User
}
```

[Full documentation →](./src/assert/README.md)

### `casing`

TypeScript literal types and type guards for different casing conventions: snake_case, PascalCase, camelCase, and kebab-case.

```ts
import {
  isSnakeCase,
  isPascalCase,
} from "@peerigon/fractals-typescript/casing";

if (isSnakeCase("user_name")) {
  // TypeScript knows this is SnakeCase<string>
}
```

[Full documentation →](./src/casing/README.md)

### `dedupe`

Remove duplicate values from an array using JavaScript's native Set for efficient deduplication.

```ts
import { dedupe } from "@peerigon/fractals-typescript/dedupe";

dedupe([1, 2, 2, 3, 3, 3]); // [1, 2, 3]
```

[Full documentation →](./src/dedupe/README.md)

### `enums`

JS-only alternative with minimal runtime footprint for TypeScript's enum when you want to use erasableSyntaxOnly.

```ts
import { enums, type Enums } from "@peerigon/fractals-typescript/enums";

const Direction = enums.define({ Up: "North", Down: "South" });
type Direction = Enums<typeof Direction>;
```

[Full documentation →](./src/enums/README.md)

### `errors`

Structured error interface for consistent error handling across your application.

```ts
import { type AppError } from "@peerigon/fractals-typescript/errors";

const error: AppError = {
  name: "ValidationError",
  message: "Invalid input",
  status: 400,
  code: "INVALID_INPUT",
};
```

### `match`

Match the given value against cases and return the matching result with exhaustive type checking.

```ts
import { match } from "@peerigon/fractals-typescript/match";

match(direction).case([
  ["up", "going up"],
  ["down", "going down"],
]); // TypeScript ensures all cases are handled
```

[Full documentation →](./src/match/README.md)

### `need`

Assert that the given value is not `null` or `undefined` and return it with a narrowed type.

```ts
import { need } from "@peerigon/fractals-typescript/need";

const config = need(process.env.API_KEY, "API_KEY is required");
// config is string, not string | undefined
```

[Full documentation →](./src/need/README.md)

### `reject`

Returns a function that throws the given error. Useful for inline error handling.

```ts
import { reject } from "@peerigon/fractals-typescript/reject";

const data = value ?? reject(new Error("Value is required"));
```

[Full documentation →](./src/reject/README.md)

### `result`

Type-safe error handling using the Result pattern, eliminating the need for try-catch blocks.

```ts
import { result } from "@peerigon/fractals-typescript/result";

const userResult = result.success(userData);
// or: result.error(new Error("User not found"));
```

Can also represent async results which are in a pending state:

```ts
import { result } from "@peerigon/fractals-typescript/result";

const userResult = result.pending<User>(); // Loading state
// Later: result.success(userData) or result.error(error)
```

[Full documentation →](./src/result/README.md)

### `unwrap`

Safely extract values from Result or nullable types, with optional fallback support.

```ts
import { unwrap } from "@peerigon/fractals-typescript/unwrap";

const value = unwrap(result, "some default value if result is unwrappable");
```

[Full documentation →](./src/unwrap/README.md)

## License

MIT

## Sponsors

[<img src="https://assets.peerigon.com/peerigon/logo/peerigon-logo-flat-spinat.png" width="150" />](https://peerigon.com)
