/* eslint-disable prefer-arrow/prefer-arrow-functions */

import { stringify } from "../lib/string.ts";
import { need } from "./../need/need.ts";

const defaultSymbol = Symbol("match.default");
const catchSymbol = Symbol("match.catch");

/**
 * Match the given `value` against `cases` and return the matching `Result`.
 *
 * This function provides exhaustive pattern matching with TypeScript, ensuring all cases
 * are handled at compile time. It works similarly to a regular `switch`/`case` statement,
 * but has a decisive advantage: TypeScript issues a type error if not all cases have been
 * implemented. An error is also thrown at runtime if a value doesn't match any case.
 *
 * ## Usage:
 *
 * Match uses tuple-based matching, ideal for enums or any type of values:
 * @example
 * ```ts
 * const Direction = enums.define({ Up: "North", Down: "South" });
 * type Direction = Enums<typeof Direction>;
 * match(Direction.Up).case([
 *   [Direction.Up, "going up"],
 *   [Direction.Down, "going down"],
 * ]); // "going up"
 * ```
 *
 * ## Special symbols:
 *
 * `match.default` - Provides a default case. When used, TypeScript no longer requires
 * all cases to be specified, allowing partial matches with a fallback.
 *
 * @example
 * ```ts
 * match<"A" | "B">("A").case([
 *   ["B", "result B"],
 *   [match.default, "default result"],
 * ]); // "default result"
 * ```
 *
 * `match.catch` - Handles unexpected runtime values while still requiring all compile-time
 * cases to be specified. Use this when you need type safety but want to handle edge cases
 * at runtime without throwing errors.
 *
 * @example
 * ```ts
 * match("C" as "A" | "B").case([
 *   ["A", "result A"],
 *   ["B", "result B"],
 *   [match.catch, "unknown value"],
 * ]); // "unknown value"
 * ```
 */
function match<const Value>(value: Value): {
  case: {
    <const Result>(
      cases: Cases<
        readonly [Value, Result],
        readonly [typeof defaultSymbol, Result]
      >,
    ): Result;
    <
      const Result,
      const GivenCases extends Cases<
        readonly [Value, Result],
        readonly [typeof catchSymbol | Value, Result]
      >,
    >(
      cases: If<
        IsExact<
          Exclude<ExtractValueFromCases<GivenCases>, typeof catchSymbol>,
          Value
        >,
        {
          then: GivenCases;
          else: never;
        }
      >,
    ): Result;
  };
};
function match<const Value>(value: Value): any {
  return {
    case: <const Result>(
      cases: Cases<
        readonly [Value, Result],
        readonly [typeof defaultSymbol | typeof catchSymbol | Value, Result]
      >,
    ): Result => {
      for (let i = 0; i < cases.length - 1; i++) {
        const [valueInCase, resultInCase] = cases[i]!;

        if (Object.is(value, valueInCase)) {
          return resultInCase;
        }
      }

      const [valueInLastCase, resultInLastCase] = need(cases.at(-1));

      if (
        Object.is(value, valueInLastCase) ||
        valueInLastCase === defaultSymbol ||
        valueInLastCase === catchSymbol
      ) {
        return resultInLastCase;
      }

      throw new Error(
        `No match found for ${stringify(value)}. Expected one of: ${cases.map(([possibleValue]) => stringify(possibleValue)).join(", ")}`,
      );
    },
  };
}

type Cases<
  Tuple extends readonly [any, any] = readonly [any, any],
  LastTuple extends readonly [any, any] = Tuple,
> = readonly [...ReadonlyArray<Tuple>, LastTuple];

type If<
  ValueToTest,
  Body extends { then: any; else: any },
> = ValueToTest extends true ? Body["then"] : Body["else"];

type IsExact<Type1, Type2> = [Type1] extends [Type2]
  ? [Type2] extends [Type1]
    ? true
    : false
  : false;

type ExtractValueFromCases<GivenCases extends Cases> = GivenCases[number][0];

match.default = defaultSymbol;
match.catch = catchSymbol;

export { match };
