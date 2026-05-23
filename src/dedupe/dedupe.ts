/**
 * Remove duplicates from an array using a Set.
 *
 * @param array - The array to remove duplicates from
 * @returns A new array with duplicate values removed, preserving order of first occurrence
 *
 * @example
 * ```ts
 * const numbers = [1, 2, 2, 3, 1, 4];
 * const unique = dedupe(numbers); // [1, 2, 3, 4]
 *
 * const strings = ["a", "b", "a", "c"];
 * const uniqueStrings = dedupe(strings); // ["a", "b", "c"]
 * ```
 */
export const dedupe = <Item>(array: Array<Item>) => [...new Set(array)];
