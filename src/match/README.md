## `match(value)`

✅ Zero dependencies

Match the given `value` against cases and return the matching result. This function provides exhaustive pattern matching with TypeScript, ensuring all cases are handled at compile time.

This function works similarly to a regular `switch`/`case` statement, but has a decisive advantage: TypeScript issues a type error if not all cases have been implemented. An error is also thrown at runtime if a value doesn't match any case.

### Usage

The API comes in two flavors:

#### Record-based matching (for simple values)

Use an object to map values to results when matching strings, numbers, or symbols:

```ts
import { match } from "@peerigon/fractals-typescript/match";

const value = "A" as "A" | "B";

match(value).case({
  A: "result A",
  B: "result B",
}); // "result A"
```

#### Tuple-based matching (for enums and complex values)

Use an array of tuples when matching enums or other complex values:

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

#### Using `match.default` for default cases

`match.default` can be used to specify a default case. When `match.default` is used, no type error is emitted for missing cases anymore. Use this when there's a reasonable default value.

```ts
const value = "A" as "A" | "B";

match<"A" | "B">("A").case({
  B: "result B",
  [match.default]: "default result",
}); // "default result"
```

#### Using `match.catch` for unknown runtime values

`match.catch` can be used to specify a catch case for unknown runtime values. With `match.catch` no runtime error is thrown but you still need to specify all cases for type safety. Use this when you need type safety but want to handle edge cases at runtime without throwing errors.

```ts
match("C" as "A" | "B").case({
  A: "result A",
  B: "result B",
  [match.catch]: "unknown value",
}); // "unknown value"
```

### API Reference

**Type parameters**:

- `Value`: The type of the value being matched (can be any type)
- `Result`: The type of the result returned from matching

**Methods**:

- `match(value)`: Creates a matcher for the given value
- `.case(cases)`: Performs the match and returns the result

**Cases format**:

- **Record format**: `{ [key: Value]: Result }` - For string, number, or symbol values
- **Tuple format**: `[[value, result], ...]` - For any type of values including enums

**Special symbols**:

- `match.default`: Provides a default result when no other case matches
- `match.catch`: Handles unexpected runtime values while still requiring all compile-time cases

### ⚠️ Limitations

1. **Record format type restrictions**: Only works with string, number, or symbol values. Complex types and branded types (like enums) require tuple format
2. **Number/string ambiguity**: In record format, the number `1` and string `"1"` cannot be distinguished as object keys.
