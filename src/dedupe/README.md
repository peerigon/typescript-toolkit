## `dedupe`

- 📦 Below 45 Bytes minified + compressed (brotli)
- ✅ Zero dependencies

Remove duplicate values from an array using JavaScript's native `Set` for efficient deduplication. Preserves the order of first occurrence for each unique value.

### Basic usage

```ts
import { dedupe } from "@peerigon/typescript-toolkit/dedupe";

const words = ["apple", "banana", "apple", "cherry", "banana"];
const uniqueWords = dedupe(words); // ["apple", "banana", "cherry"]
```

### API Reference

#### `dedupe(array)`

Returns a new array with duplicate values removed (first occurrence kept).

```ts
dedupe<Item>(array: Array<Item>): Array<Item>
```

| Type parameter | Description                |
| -------------- | -------------------------- |
| `Item`         | Type of items in the array |

| Parameter | Type          | Description          |
| --------- | ------------- | -------------------- |
| `array`   | `Array<Item>` | Array to deduplicate |

**Returns:** `Array<Item>` — new array; original is not mutated

### ⚠️ Behavior Notes

- **Order Preservation**: Maintains the order of the first occurrence of each unique value
- **Reference Equality**: Uses JavaScript's `Set` which compares by reference for objects and by value for primitives
- **New Array**: Always returns a new array; does not mutate the original
- **Performance**: Efficient O(n) time complexity using `Set` internally
- **Primitive Types**: Works perfectly with numbers, strings, booleans, symbols, etc.
- **Object Types**: Deduplicates based on object reference, not content equality
