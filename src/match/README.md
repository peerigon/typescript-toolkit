## `match`

- 📦 Below 400 Bytes
- ✅ Zero dependencies

Match the given `value` against cases and return the matching result. This function provides exhaustive pattern matching with TypeScript, ensuring all cases are handled at compile time.

This function works similarly to a regular `switch`/`case` statement, but has a decisive advantage: TypeScript issues a type error if not all cases have been implemented. An error is also thrown at runtime if a value doesn't match any case.

### Usage

Value -> Result mappings are defined as an array of tuples (`Array<[Value, Result]>`), which is the JavaScript way to represent key-value pairs:

```ts
import { match } from "@peerigon/fractals-typescript/match";
import { enums, type Enums } from "@peerigon/fractals-typescript/enums";

const Direction = enums.define({ Up: "North", Down: "South" });
type Direction = Enums<typeof Direction>;

match(Direction.Up).case([
  [Direction.Up, "going up"],
  [Direction.Down, "going down"],
]); // "going up"
```

You can also match against `undefined`:

```ts
const maybeDirection: Direction | undefined = undefined;

match(maybeDirection).case([
  [Direction.Up, "going up"],
  [Direction.Down, "going down"],
  [undefined, "no direction"],
]); // "no direction"
```

#### Using `match.default` for default cases

`match.default` can be used to specify a default case. When `match.default` is used, no type error is emitted for missing cases anymore. Use this when there's a reasonable default value.

```ts
const value = "A" as "A" | "B";

match<"A" | "B">("A").case([
  ["B", "result B"],
  [match.default, "default result"],
]); // "default result"
```

#### Using `match.catch` for unknown runtime values

`match.catch` can be used to specify a catch case for unknown runtime values. With `match.catch` no runtime error is thrown but you still need to specify all cases for type safety. Use this when you need type safety but want to handle edge cases at runtime without throwing errors.

```ts
match("C" as "A" | "B").case([
  ["A", "result A"],
  ["B", "result B"],
  [match.catch, "unknown value"],
]); // "unknown value"
```

### API Reference

**Type parameters**:

- `Value`: The type of the value being matched (can be any type)
- `Result`: The type of the result returned from matching

**Methods**:

- `match(value)`: Creates a matcher for the given value
- `.case(cases)`: Performs the match and returns the result

**Cases format**:

- **Tuple format**: `[[value, result], ...]` - An array of tuples mapping values to results

**Special symbols**:

- `match.default`: Provides a default result when no other case matches
- `match.catch`: Handles unexpected runtime values while still requiring all compile-time cases
