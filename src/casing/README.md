## `casing`

- 📦 Below 100 Bytes
- ✅ Zero dependencies

TypeScript literal types and type guards for different casing conventions. This module provides precise types for `SNAKE_CASE`, `PascalCase`, `camelCase`, and `kebab-case` strings, along with runtime type guards to verify strings conform to these conventions.

### Usage

```ts
import {
  isCamelCase,
  isKebabCase,
  isPascalCase,
  isSnakeCase,
  type CamelCase,
  type KebabCase,
  type PascalCase,
  type SnakeCase,
} from "@peerigon/fractals-typescript/casing";

// Type guards for runtime validation
if (isSnakeCase("USER_ID")) {
  // TypeScript knows this is SnakeCase
}

// Use in filtering
const values = ["SNAKE_CASE", "PascalCase", "camelCase", "kebab-case"];
const snakeCases = values.filter(isSnakeCase); // SnakeCase[]
const pascalCases = values.filter(isPascalCase); // PascalCase[]
```

#### Type narrowing

The type guards narrow string types to their specific casing convention:

```ts
function processApiKey(key: string) {
  if (isSnakeCase(key)) {
    // TypeScript knows key is SnakeCase
    const apiKey: SnakeCase = key; // No type error
  }
}
```

#### Literal type building blocks

The module exports literal types for Latin alphabet characters:

```ts
import {
  type Digit,
  type LatinAlphabetLowercase,
  type LatinAlphabetUppercase,
} from "@peerigon/fractals-typescript/casing";

const upper: LatinAlphabetUppercase = "A"; // "A" | "B" | ... | "Z"
const lower: LatinAlphabetLowercase = "a"; // "a" | "b" | ... | "z"
const digit: Digit = "5"; // "0" | "1" | ... | "9"
```

### Casing Conventions

#### SNAKE_CASE

All uppercase letters with underscores as separators:

```ts
isSnakeCase("HELLO_WORLD"); // ✅ true
isSnakeCase("USER_ID_123"); // ✅ true
isSnakeCase("_PRIVATE"); // ✅ true
isSnakeCase("helloWorld"); // ❌ false
isSnakeCase("hello_world"); // ❌ false (lowercase)
```

#### PascalCase

First letter uppercase, no separators:

```ts
isPascalCase("HelloWorld"); // ✅ true
isPascalCase("UserProfile"); // ✅ true
isPascalCase("Component123"); // ✅ true
isPascalCase("helloWorld"); // ❌ false (starts lowercase)
isPascalCase("Hello_World"); // ❌ false (contains underscore)
```

#### camelCase

First letter lowercase, no separators:

```ts
isCamelCase("helloWorld"); // ✅ true
isCamelCase("userProfile"); // ✅ true
isCamelCase("apiKey123"); // ✅ true
isCamelCase("HelloWorld"); // ❌ false (starts uppercase)
isCamelCase("hello_world"); // ❌ false (contains underscore)
```

#### kebab-case

All lowercase with hyphens as separators:

```ts
isKebabCase("hello-world"); // ✅ true
isKebabCase("user-profile"); // ✅ true
isKebabCase("api-key-123"); // ✅ true
isKebabCase("helloWorld"); // ❌ false (contains uppercase)
isKebabCase("hello_world"); // ❌ false (contains underscore)
```

### API Reference

**Type Guards**:

- `isSnakeCase(value: string): value is SnakeCase` - Checks for SNAKE_CASE
- `isPascalCase(value: string): value is PascalCase` - Checks for PascalCase
- `isCamelCase(value: string): value is CamelCase` - Checks for camelCase
- `isKebabCase(value: string): value is KebabCase` - Checks for kebab-case

**Types**:

- `SnakeCase<T extends string = string>` - Type for SNAKE_CASE strings
- `PascalCase<T extends string = string>` - Type for PascalCase strings
- `CamelCase<T extends string = string>` - Type for camelCase strings
- `KebabCase<T extends string = string>` - Type for kebab-case strings
- `LatinAlphabetUppercase` - Literal type union of "A" | "B" | ... | "Z"
- `LatinAlphabetLowercase` - Literal type union of "a" | "b" | ... | "z"
- `Digit` - Literal type union of "0" | "1" | ... | "9"

### ⚠️ Behavior Notes

- **Empty strings**: All type guards return `false` for empty strings
- **Numbers at start**: Strings starting with numbers are rejected by all guards
- **Special characters**: Only underscores (SNAKE_CASE) and hyphens (kebab-case) are allowed as separators
- **Mixed casing**: Each convention strictly enforces its casing rules
