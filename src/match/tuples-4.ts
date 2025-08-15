/* eslint-disable prefer-arrow/prefer-arrow-functions */

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
const Example1 = {
  A: "a",
  B: "b",
} as const;

const defaultSymbol = Symbol("default");
const catchSymbol = Symbol("catch");

type ValueOf<GivenRecord> = GivenRecord[keyof GivenRecord];

function match<const Value, const Result>(
  value: Value,
  cases: [...Array<[Value, Result]>, [typeof defaultSymbol, Result]],
): Result;
function match<const Value, const Cases extends Value, const Result>(
  value: Value,
  cases: [
    ...AssertIsExact<Array<[Cases, Result]>, Array<[Value, Result]>>,
    [typeof catchSymbol, Result],
  ],
): Result;
function match<const Value, const Cases extends Value, const Result>(
  value: Value,
  // This is a false positive
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  cases: AssertIsExact<Array<[Cases, Result]>, Array<[Value, Result]>>,
): Result;
function match<const Value, const Result>(
  value: Value,
  cases:
    | [...Array<[Value, Result]>, [typeof defaultSymbol, Result]]
    | [...Array<[Value, Result]>, [typeof catchSymbol, Result]]
    | Array<[Value, Result]>,
): Result {
  return 0 as any;
}

const value = "a" as ValueOf<typeof Example1>;

let result: boolean;

result = match(value, [
  ["a", true],
  ["b", false],
]);

result = match(
  value,
  // @ts-expect-error Should show a type error here because not all
  [
    // ["a", true],
    ["b", false],
  ],
);

result = match(value, [
  ["b", false],
  [defaultSymbol, true],
]);

result = match(value, [
  ["a", true],
  ["b", false],
  [catchSymbol, false],
]);

type AssertIsExact<Type1, Type2> = [Type1] extends [Type2]
  ? [Type2] extends [Type1]
    ? Type1
    : never
  : never;
