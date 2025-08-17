/* eslint-disable func-style */
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
 * ## The API comes in two flavors:
 *
 * ### 1. Record-based matching (for string, number, or symbol values)
 * @example
 * ```ts
 * match<"A" | "B">("A").case({
 *   A: "result A",
 *   B: "result B",
 * }); // "result A"
 * ```
 *
 * ### 2. Tuple-based matching (for enums or complex values)
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
 * match<"A" | "B">("A").case({
 *   B: "result B",
 *   [match.default]: "default result",
 * }); // "default result"
 * ```
 *
 * `match.catch` - Handles unexpected runtime values while still requiring all compile-time
 * cases to be specified. Use this when you need type safety but want to handle edge cases
 * at runtime without throwing errors.
 *
 * @example
 * ```ts
 * match("C" as "A" | "B").case({
 *   A: "result A",
 *   B: "result B",
 *   [match.catch]: "unknown value",
 * }); // "unknown value"
 * ```
 */
function match<const Value extends PropertyKey>(
  value: NotBranded<Value>,
): {
  case: <const Result>(cases: CasesAsRecord<Value, Result>) => Result;
};
function match<const Value>(value: Value): {
  case: {
    <const Result>(
      cases: CasesAsTuples<
        readonly [Value, Result],
        readonly [typeof defaultSymbol, Result]
      >,
    ): Result;
    <
      const Result,
      const Cases extends CasesAsTuples<
        readonly [Value, Result],
        readonly [typeof catchSymbol | Value, Result]
      >,
    >(
      cases: If<
        IsExact<
          Exclude<ExtractValueFromCases<Cases>, typeof catchSymbol>,
          Value
        >,
        {
          then: Cases;
          else: never;
        }
      >,
    ): Result;
  };
};
function match<const Value>(value: Value): any {
  function _case<const Result>(
    cases:
      | CasesAsRecord<Value & PropertyKey, Result>
      | CasesAsTuples<
          readonly [Value, Result],
          readonly [typeof defaultSymbol | typeof catchSymbol | Value, Result]
        >,
  ): Result {
    if (Array.isArray(cases)) {
      const casesAsTuples = cases as CasesAsTuples<
        readonly [Value, Result],
        readonly [typeof defaultSymbol | typeof catchSymbol | Value, Result]
      >;

      for (let i = 0; i < casesAsTuples.length - 1; i++) {
        const [valueInCase, resultInCase] = casesAsTuples[i]!;

        if (value === valueInCase) {
          return resultInCase;
        }
      }

      const [valueInLastCase, resultInLastCase] = need(casesAsTuples.at(-1));

      if (
        value === valueInLastCase ||
        valueInLastCase === defaultSymbol ||
        valueInLastCase === catchSymbol
      ) {
        return resultInLastCase;
      }

      throwNoMatch(
        value,
        casesAsTuples.map(([value]) => value),
      );
    } else if (
      (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "symbol") &&
      typeof cases === "object" &&
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      cases !== null
    ) {
      const casesAsRecord = cases as CasesAsRecord<PropertyKey, Result>;

      if (value in casesAsRecord) {
        return casesAsRecord[value];
      }

      if (defaultSymbol in casesAsRecord) {
        return casesAsRecord[defaultSymbol]!;
      }

      if (catchSymbol in casesAsRecord) {
        return casesAsRecord[catchSymbol]!;
      }

      throwNoMatch(value, Object.keys(casesAsRecord));
    }

    throw new TypeError("Unexpected value or cases type");
  }

  return {
    case: _case,
  };
}

const throwNoMatch = (value: unknown, possibleValues: Array<unknown>) => {
  throw new Error(
    `No match found for ${stringify(value)}. Expected one of: ${possibleValues.map((possibleValue) => stringify(possibleValue)).join(", ")}`,
  );
};

type RecordKey = string | number | symbol;

type CasesAsRecord<Value extends RecordKey, Result> =
  | (Record<Value, Result> & Partial<Record<typeof catchSymbol, Result>>)
  | (Record<typeof defaultSymbol, Result> & Partial<Record<Value, Result>>);

type CasesAsTuples<
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

type NotBranded<Type> = Type extends Record<symbol, any> ? never : Type;

type ExtractValueFromCases<GivenCases extends CasesAsTuples> =
  GivenCases[number][0];

match.default = defaultSymbol;
match.catch = catchSymbol;

export { match };
