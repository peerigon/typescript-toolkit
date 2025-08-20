/**
 * Represents a JSON-serializable value that can be safely passed through JSON.parse(JSON.stringify()).
 * Excludes undefined, functions, symbols, and other non-serializable types.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | Array<JsonValue>
  | { [key: string]: JsonValue };
