## `match`

- 📦 Below 400 Bytes
- ✅ Zero dependencies

Match the given `value` against cases and return the matching result. This function provides exhaustive pattern matching with TypeScript, ensuring all cases are handled at compile time. An error is also thrown at runtime if a value doesn't match any case.

### Basic usage

Value -> Result mappings are defined as an array of tuples (`Array<[Value, Result]>`), which is the JavaScript way to represent arbitrary key-value pairs (e.g. Object.entries()):

```ts
import { enums, type Enums } from "@peerigon/typescript-toolkit/enums";
import { match } from "@peerigon/typescript-toolkit/match";

const Direction = enums.define({ Up: "North", Down: "South" });
type Direction = Enums<typeof Direction>;

let direction: Direction = Direction.Up;

match(direction).case([
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
let maybeDirection: Direction | undefined = undefined;

match(maybeDirection).case([
  [Direction.Up, "going up"],
  // Must be last tuple
  [match.default, "default direction"],
]); // "default direction"
```

#### Using `match.catch` for unknown runtime values

`match.catch` can be used to specify a catch case for unknown runtime values. With `match.catch` no runtime error is thrown but you still need to specify all cases for type safety. Use this when you need type safety but want to handle edge cases at runtime without throwing errors.

```ts
let maybeDirection: Direction | undefined = undefined;

match(maybeDirection).case([
  [Direction.Up, "going up"],
  // Must be last tuple
  [match.catch, "unknown direction"],
]); // "unknown direction"
```

### Matching order

Cases are checked from top to bottom; the **first** match wins (`Object.is` is used for comparison, so `+0` and `-0` differ).

`match.default` and `match.catch` must be the last tuple in the array and cannot be used together. They provide fallback behavior:

- `match.default`: Fallback for any value not listed
- `match.catch`: Fallback only for unexpected runtime values; all expected cases must still be listed

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
