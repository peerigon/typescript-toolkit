## `match(value, cases)`

✅ Zero dependencies

Match the given `value` against `cases` and return the matching `Result`. `cases` is an object that maps all possible `value`s on a `Result`. Typically, `value` is a value from an enum and `cases` is a list of all possible enum values.

This function works similarly to a regular `switch`/`case` statement, but has a decisive advantage: TypeScript issues a type error if not all cases have been implemented. An error is also thrown at runtime if a value doesn't match any case.

### Usage

```ts
import { match } from "@peerigon/fractals-typescript/match";

type Color = "red" | "green" | "blue";

const getColorHex = (color: Color): string => {
  return match(color, {
    red: "#ff0000",
    green: "#00ff00",
    // Shows a type error here because "blue" hasn't been implemented
  });
};
```

#### Using `match.default` for default cases

`match.default` can be used to specify a default case. When `match.default` is used, no type error is emitted for missing cases anymore. Use this when there's a reasonable default value.

```ts
const getColorHex = (color: Color): string => {
  return match(color, {
    red: "#ff0000",
    [match.default]: "#000000", // Default to black for any other color
  });
};
```

#### Using `match.catch` for unknown runtime values

`match.catch` can be used to specify a catch case for unknown runtime values. With `match.catch` no runtime error is thrown but you still need to specify all cases for type safety.

```ts
const getColorHex = (color: Color): string => {
  return match(color, {
    red: "#ff0000",
    green: "#00ff00",
    blue: "#0000ff",
    [match.catch]: "#000000", // Handle unexpected runtime values
  });
};
```

### API Reference

**Type parameters**:

- `Value extends string | number | symbol`
- `Result`

**Parameters**:

- `value` (`Value`): The given value.
- `cases` (`MatchCases<Value, Result>`): All possible cases that `value` can be. Can also include `match.default` and/or `match.catch` for special handling.

**Returns**: `Result`

### ⚠️ Limitations

Since `cases` is an object, it cannot distinguish between the number `1` and the string `"1"`. This is because all `number` properties are cast to a `string` in JavaScript.

This is a deliberate limitation of the API, as `match` has been designed specifically to match against enums, which are typically all of the same base type.
