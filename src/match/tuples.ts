import { enums, type Enums } from "../enums/enums.ts";
import { stringify } from "../lib/string.ts";
import { need } from "./../need/need";

const defaultSymbol = Symbol("match.default");
const catchSymbol = Symbol("match.catch");

const match = <const Value>(value: Value) => {
  function _case<const Result>(
    cases: [...Array<[Value, Result]>, [typeof defaultSymbol, Result]],
  ): Result;
  function _case<const Cases extends Value, const Result>(
    cases: [
      ...AssertIsExact<
        [...Array<[Cases, Result]>, [Cases, Result]],
        [...Array<[Value, Result]>, [Value, Result]]
      >,
      [typeof catchSymbol, Result],
    ],
  ): Result;
  function _case<const Cases extends Value, const Result>(
    cases: AssertIsExact<
      [...Array<[Cases, Result]>, [Cases, Result]],
      [...Array<[Value, Result]>, [Value, Result]]
    >,
  ): Result;
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  function _case<const Value, const Result>(
    cases:
      | [...Array<[Value, Result]>, [typeof defaultSymbol, Result]]
      | [...Array<[Value, Result]>, [typeof catchSymbol, Result]]
      | [...Array<[Value, Result]>, [Value, Result]],
  ): Result {
    for (let i = 0; i < cases.length - 1; i++) {
      const [valueInCase, resultInCase] = cases[i]!;

      if (value === valueInCase) {
        return resultInCase;
      }
    }

    const [valueInLastCase, resultInLastCase] = need(cases.at(-1));

    if (
      value === valueInLastCase ||
      valueInLastCase === defaultSymbol ||
      valueInLastCase === catchSymbol
    ) {
      return resultInLastCase;
    }

    throw new Error(
      `No match found for ${stringify(value)}. Expected one of: ${cases.map(([value]) => stringify(value)).join(", ")}`,
    );
  }

  return {
    case: _case,
  };
};

type ValueOf<GivenRecord> = GivenRecord[keyof GivenRecord];

type AssertIsExact<Type1, Type2> = [Type1] extends [Type2]
  ? [Type2] extends [Type1]
    ? Type1
    : never
  : never;

const _Example1 = {
  A: "a",
  B: "b",
} as const;

const value = "a" as ValueOf<typeof _Example1>;

let _result: boolean;

_result = match(value).case([
  ["a", true],
  ["b", false],
]);

_result = match(value).case(
  // @ts-expect-error Should show a type error here because not all
  [
    // ["a", true],
    ["b", false],
  ],
);

_result = match(value).case([
  ["b", false],
  [defaultSymbol, true],
]);

_result = match(value).case([[defaultSymbol, true]]);

_result = match(value).case(
  // @ts-expect-error Should show a type error here because there must be at least one default case
  [],
);

_result = match(value).case([
  ["a", true],
  ["b", false],
  [catchSymbol, false],
]);

_result = match(value).case(
  // @ts-expect-error Should show a type error here because catch doesn't free us from implementing all cases
  [
    ["a", true],
    [catchSymbol, false],
  ],
);

_result = match(value).case(
  // @ts-expect-error Should show a type error here because catch doesn't free us from implementing all cases
  [[catchSymbol, false]],
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
