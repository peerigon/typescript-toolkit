/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
const Example1 = {
  A: "a",
  B: "b",
} as const;

type ValueOf<GivenRecord> = GivenRecord[keyof GivenRecord];

const match = <
  const Value,
  const Cases extends ValueOf<typeof Example1>,
  const Result,
>(
  value: Value,
  cases: Array<[Cases, Result]>,
): IsExactMatch<Cases, ValueOf<typeof Example1>> extends true
  ? Result
  : never => {
  // TODO: Implement the match function
  return 0 as any;
};

const result = match("a", [
  // ["a", true],
  ["b", false],
]);

type IsExactMatch<T, U> = [T] extends [U]
  ? [U] extends [T]
    ? true
    : false
  : false;

console.log(result);
