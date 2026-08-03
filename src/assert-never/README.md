## `assertNever`

- 📦 Below 200 Bytes minified + compressed (brotli)
- ✅ Zero dependencies

Assert that a code path is unreachable, typically the `default` case of a `switch`/`case` statement over a union type.

`assertNever` only accepts a value whose type has already been narrowed to `never`. If you handle every case of a union, TypeScript narrows the value in the `default` branch to `never` and the call compiles. If the union later gains a new member, TypeScript reports a compile-time error at the `assertNever` call site instead of silently falling through. At runtime, `assertNever` throws, guarding against values that slip through despite the type system (e.g. from `JSON.parse` or an external API).

### Basic usage

```ts
import { assertNever } from "@peerigon/typescript-toolkit/assert-never";

type Direction = "down" | "up";

const describeDirection = (direction: Direction): string => {
  switch (direction) {
    case "up":
      return "going up";
    case "down":
      return "going down";
    default:
      // TypeScript error here if a case for "Direction" is missing
      return assertNever(direction);
  }
};
```

### With custom error message

```ts
default:
  return assertNever(direction, "Unhandled direction");

// Custom error messages just for the development build. Production builds will remove the message. In that case, a generic default error message is used.
default:
  return assertNever(
    direction,
    import.meta.env.DEV && `Unhandled direction: ${direction}`,
  );
```

### API Reference

#### `assertNever(value, errorMessage?)`

Asserts that `value` is of type `never` and throws at runtime.

```ts
assertNever(value: never, errorMessage?: ErrorMessage): never
```

| Parameter      | Type                      | Description                                                                             |
| -------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| `value`        | `never`                   | Value that should be unreachable, i.e. all union members have already been handled      |
| `errorMessage` | `ErrorMessage` (optional) | Custom message: `string`, `false`, or a lazy function. Default: `"Unexpected value: …"` |

**Throws:** `TypeError` unconditionally, since reaching this function is always a bug or an unexpected runtime value.
