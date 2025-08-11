/**
 * Remove duplicates from an array using a Set.
 */
export const dedupe = <Item>(array: Array<Item>) => [...new Set(array)];
