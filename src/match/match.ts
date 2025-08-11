const defaultSymbol = Symbol("match.default");
const catchSymbol = Symbol("match.catch");

/**
 * Match the given `value` against `cases` and return the matching `Result`.
 * `cases` is an object that maps all possible `value`s on a `Result`.
 * Typically, `value` is a value from an enum and `cases` is a list of all possible enum values.
 *
 * This function works similarly to a regular `switch`/`case` statement, but has a decisive advantage:
 * TypeScript issues a type error if not all cases have been implemented.
 * An error is also thrown at runtime if a value doesn't match any case.
 *
 * @example
 * ```ts
 * match("A", {
 *   A: "result A",
 * }); // "result A"
 * ```
 *
 * `match.default` can be used to specify a default case. When `match.default` is used,
 * no type error is emitted for missing cases anymore. Use this when there's a reasonable default value.
 *
 * @example
 * ```ts
 * match("A", {
 *   [match.default]: "default result",
 * }); // "default result"
 * ```
 *
 * `match.catch` can be used to specify a catch case for unknown runtime values.
 * With `match.catch` no runtime error is thrown but you still need to specify all cases.
 *
 * @example
 * ```ts
 * match("B" as "A", {
 *   A: "result A",
 *   [match.catch]: "unknown runtime value",
 * }); // "unknown runtime value"
 * ```
 */
export const match: {
  <Value extends string | number | symbol, Result>(
    value: Value,
    cases: MatchCases<Value, Result>,
  ): Result;
  default: typeof defaultSymbol;
  catch: typeof catchSymbol;
} = <Value extends string | number | symbol, Result>(
  value: Value,
  cases: MatchCases<Value, Result>,
) => {
  if (value in cases) {
    return cases[value] as Result;
  }

  if (defaultSymbol in cases) {
    return cases[defaultSymbol];
  }

  if (catchSymbol in cases) {
    return cases[catchSymbol];
  }

  throw new Error(
    `No match found for ${String(value)}. Expected one of: ${Object.keys(cases).join(", ")}`,
  );
};

match.default = defaultSymbol;
match.catch = catchSymbol;

type MatchCases<Value extends string | number | symbol, Result> =
  | Record<Value, Result>
  | (Partial<Record<Value, Result>> & Record<typeof defaultSymbol, Result>)
  | Record<Value | typeof catchSymbol, Result>;
