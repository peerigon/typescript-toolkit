/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-useless-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
const Example1 = {
  A: "a",
  B: "b",
} as const;

const defaultSymbol = Symbol("default");
const catchSymbol = Symbol("catch");

type ValueOf<GivenRecord> = GivenRecord[keyof GivenRecord];

function match<const Value, const Cases extends Value, const Result>(
  value: Value,
  cases: AssertIsExact<
    Array<[Cases | typeof catchSymbol, Result]>,
    Array<[Value | typeof catchSymbol, Result]>
  >,
): Result;
function match<const Value, const Cases extends Value, const Result>(
  value: Value,
  cases:
    | AssertIsExact<
        Array<[Cases | typeof catchSymbol, Result]>,
        Array<[Value | typeof catchSymbol, Result]>
      >
    | Array<[Cases | typeof defaultSymbol, Result]>,
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

type Bla = Array<typeof defaultSymbol | boolean>;

type Bla2 = ContainsDefaultSymbol<Bla>;

type ContainsDefaultSymbol<Type extends Array<any>> =
  typeof defaultSymbol extends Type[number] ? true : false;

type AssertIsExact<Type1, Type2> = [Type1] extends [Type2]
  ? [Type2] extends [Type1]
    ? Type1
    : never
  : never;

console.log(result);
