## `dedupe(array)`

✅ Zero dependencies

Remove duplicate values from an array using JavaScript's native `Set` for efficient deduplication. Preserves the order of first occurrence for each unique value.

### Usage

```ts
import { dedupe } from "@peerigon/fractals-typescript/dedupe";

// Remove duplicate numbers
const numbers = [1, 2, 2, 3, 1, 4, 2];
const uniqueNumbers = dedupe(numbers);
console.log(uniqueNumbers); // [1, 2, 3, 4]

// Remove duplicate strings
const words = ["apple", "banana", "apple", "cherry", "banana"];
const uniqueWords = dedupe(words);
console.log(uniqueWords); // ["apple", "banana", "cherry"]

// Works with any type that can be compared by Set
const booleans = [true, false, true, true, false];
const uniqueBooleans = dedupe(booleans);
console.log(uniqueBooleans); // [true, false]
```

#### With complex objects

`dedupe` uses `Set` for comparison, which means it works with primitive values and object references:

```ts
const object1 = { id: 1, name: "Alice" };
const object2 = { id: 2, name: "Bob" };
const object3 = { id: 1, name: "Alice" }; // Different reference, same content

const objects = [object1, object2, object1, object3]; // object1 appears twice
const uniqueObjects = dedupe(objects);
console.log(uniqueObjects); // [object1, object2, object3] - all three objects (different references)
```

#### Type preservation

The function preserves the exact type of the input array:

```ts
const stringArray: Array<string> = ["a", "b", "a"];
const result: Array<string> = dedupe(stringArray); // Type is Array<string>

const numberArray: Array<number> = [1, 2, 1];
const numberResult: Array<number> = dedupe(numberArray); // Type is Array<number>

const mixedArray: Array<string | number> = ["a", 1, "a", 2];
const mixedResult: Array<string | number> = dedupe(mixedArray); // Type is Array<string | number>
```

### API Reference

**Type parameters**:

- `Item`: The type of items in the array

**Parameters**:

- `array` (`Array<Item>`): The array to remove duplicates from

**Returns**: `Array<Item>` - A new array with duplicate values removed, preserving order of first occurrence

### ⚠️ Behavior Notes

- **Order Preservation**: Maintains the order of the first occurrence of each unique value
- **Reference Equality**: Uses JavaScript's `Set` which compares by reference for objects and by value for primitives
- **New Array**: Always returns a new array; does not mutate the original
- **Performance**: Efficient O(n) time complexity using `Set` internally
- **Primitive Types**: Works perfectly with numbers, strings, booleans, symbols, etc.
- **Object Types**: Deduplicates based on object reference, not content equality
