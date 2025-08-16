/* eslint-disable func-style */
/* eslint-disable prefer-arrow/prefer-arrow-functions */

import { enums, type Enums } from "../enums/enums.ts";
import { stringify } from "../lib/string.ts";
import { need } from "./../need/need";

const defaultSymbol = Symbol("match.default");
const catchSymbol = Symbol("match.catch");

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

type ValueOf<GivenRecord> = GivenRecord[keyof GivenRecord];

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

const _Example1 = {
  A: "a",
  B: "b",
} as const;

const value = "a" as ValueOf<typeof _Example1>;

let _result: boolean;

_result = match(value).case({
  a: true,
  b: false,
});

_result = match(value).case(
  // @ts-expect-error Should show a type error here because not all cases are covered
  {
    a: true,
  },
);

const Direction = enums.define({
  Up: "up",
  Down: "down",
  Left: "left",
  Right: "right",
});
type Direction = Enums<typeof Direction>;
const direction = Direction.Up as Direction;
let _directionResult: string;

_directionResult = match(direction).case([
  [Direction.Up, "up"],
  [Direction.Down, "down"],
  [Direction.Left, "left"],
  [Direction.Right, "right"],
]);

_result = match(value).case(
  // @ts-expect-error Should show a type error here because not all cases are covered
  [
    // ["a", true],
    ["b", false],
  ],
);

_result = match(value).case(
  // @ts-expect-error Should show a type error here because the record notation should be used instead of tuples
  [
    ["b", false],
    [defaultSymbol, true],
  ],
);

_result = match(value).case({
  b: false,
  [defaultSymbol]: true,
});

_result = match(value).case(
  // @ts-expect-error Should show a type error here because there must be at least one default case
  [],
);

_result = match(value).case(
  // @ts-expect-error Should show a type error here because the record notation should be used instead of tuples
  [
    ["a", true],
    ["b", false],
    [catchSymbol, false],
  ],
);

_result = match(value).case({
  a: true,
  b: false,
  [catchSymbol]: false,
});

_result = match(value).case(
  // @ts-expect-error Should show a type error here because catch doesn't free us from implementing all cases
  {
    a: true,
    [catchSymbol]: false,
  },
);

_result = match(value).case({
  // @ts-expect-error Should show a type error here because catch doesn't free us from implementing all cases
  [catchSymbol]: false,
});

const _casesAsConst = [
  ["a", true],
  ["b", false],
  [catchSymbol, false],
] as const;
type _CasesAsConst = Exclude<
  ExtractValueFromCases<typeof _casesAsConst>,
  typeof catchSymbol
>;
type _Overload = [...Array<[Direction, string]>, [Direction, string]];

const _directionTest: _Overload = [
  [Direction.Up, "up"],
  [Direction.Down, "down"],
  [Direction.Left, "left"],
  [Direction.Right, "right"],
];

_directionResult = match(direction).case([
  [Direction.Up, "up"],
  [Direction.Down, "down"],
  [Direction.Left, "left"],
  [Direction.Right, "right"],
]);

_directionResult = match(direction).case(
  // @ts-expect-error Should show a type error here because not all enum cases are covered
  [
    [Direction.Up, "up"],
    // [Direction.Down, "down"],
    [Direction.Left, "left"],
    [Direction.Right, "right"],
  ],
);
