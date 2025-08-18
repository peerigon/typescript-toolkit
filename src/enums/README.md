## `enums.define(definition)` & `Enums<Definition>`

✅ Zero dependencies

JS-only alternative with minimal runtime footprint for TypeScript's `enum` when you want to use `erasableSyntaxOnly` (read [here](https://www.totaltypescript.com/erasable-syntax-only) why). Mimics the behavior of string-based `enum`.

### Usage

#### Basic enum definition

```ts
import { enums, type Enums } from "@peerigon/fractals-typescript/enums";
import { match } from "@peerigon/fractals-typescript/match";

// Define an enum using property keys as values

/** Represents the cardinal directions */
const Direction = enums.define({
  /** Add JSDoc comments here to explain each option */
  North: true, // true means that the key name is used as the value
  South: true,
  East: true,
  West: true,
});
// Derive the union type of all enum values
type Direction = Enums<typeof Direction>;

console.log(Direction.North); // "North"
// Hovering over Direction.South shows the JSDoc
console.log(Direction.South); // "South"

// Combine with match() for pattern matching and exhaustiveness checks
function getOpposite(direction: Direction) {
  return match(direction).case([
    // Shows a type error here because not all cases have been implemented
    [Direction.North, Direction.South],
    [Direction.South, Direction.North],
    [Direction.East, Direction.West],
  ]);
}
```

#### Custom enum values

```ts
// Mix different value types
const Status = enums.define({
  Active: "Active",
  Inactive: 0,
  Unknown: Symbol("unknown"),
});
type Status = Enums<typeof Status>;

console.log(Status.Active); // "Active"
console.log(Status.Inactive); // 0
console.log(Status.Unknown); // Symbol(unknown)
```

#### Type safety

`enums.define` creates ["branded" types](https://egghead.io/blog/using-branded-types-in-typescript) for each option. This means that you must reference the enum property and can't assign the primitive value directly:

```ts
const Color = enums.define({
  Red: true,
  Green: true,
});
type Color = Enums<typeof Color>;

let color: Color;

color = Color.Red; // ✅ Valid
color = "Red"; // ❌ TypeScript error, because Color.Red and Color.Green are branded
```

By default, all enums are branded with the same symbol. This means that another enum with the same primitive value _can_ be assigned:

```ts
const Status = enums.define({
  Red: true, // Same value as Color.Red
  Green: true, // Same value as Color.Green
});
type Status = Enums<typeof Status>;

// ✅ Will work because Status.Red and Color.Red use "Red"
// as primitive value and the same default symbol as brand... :/
color = Status.Red;
```

Although not ideal, this shouldn't be a problem in practice because you typically don't mix enums like this.
For maximum type safety, you can use branded enums (see below).

### Branded Enums

Use `enums.define.branded()` to create enums that cannot be mixed even if they have identical values:

```ts
// Two enums with same values but different brands
const ColorBrand = Symbol("Color");
const Color = enums.define.branded(ColorBrand, {
  Red: true,
  Green: true,
});
type Color = Enums<typeof Color>;

const StatusBrand = Symbol("Status");
const Status = enums.define.branded(StatusBrand, {
  Red: true, // Same value as Color.Red
  Green: true, // Same value as Color.Green
});
type Status = Enums<typeof Status>;

let color: Color;
let status: Status;

color = Color.Red; // ✅ Valid
color = Status.Red; // ❌ TypeScript error - cannot mix branded enums

status = Status.Red; // ✅ Valid
status = Color.Red; // ❌ TypeScript error - cannot mix branded enums
```

### API Reference

#### `enums.define(definition)`

Creates a type-safe enum from an object definition.

**Parameters**:

- `definition`: Object where keys become enum names and values become enum values. Use `true` to use the key name as the value.

**Returns**: Frozen enum object with type-safe values

#### `enums.define.branded(symbol, definition)`

Creates a branded enum that cannot be mixed with other enums.

**Parameters**:

- `symbol`: A unique symbol to brand the enum type
- `definition`: Object defining the enum keys and values

**Returns**: Frozen branded enum object

#### `Enums<Definition>`

Type utility to extract the union type of all enum values.

**Type parameters**:

- `Definition`: The enum definition object type

**Returns**: Union type of all enum values

### ⚠️ Behavior Notes

- **Frozen Objects**: All enum objects are frozen with `Object.freeze()` to prevent modification
- **Value Mapping**: When a property value is `true`, the property key becomes the enum value
- **Type Safety**: Prevents mixing enums with primitive values
- **Branded Safety**: Branded enums provide additional type safety to prevent accidental mixing
- **No Runtime Overhead**: Uses compile-time type checking with minimal runtime footprint
