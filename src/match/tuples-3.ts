// Example1
type ExampleInput1 = {
  B: "b";
  A: "a";
};
type ExpectedOutput1 = Array<["b" | "a", any]>;

// Example2
type ExampleInput2 = {
  A: "a";
  B: "b";
  C: "c";
};
type ExpectedOutput2 = Array<["a" | "b" | "c", any]>;

// Example3
type ExampleInput3 = {
  A: ["a"];
  B: ["b"];
};
type ExpectedOutput3 = Array<[["a"] | ["b"], any]>;

type ValueOf<GivenRecord> = GivenRecord[keyof GivenRecord];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

type LastOf<T> =
  UnionToIntersection<T extends any ? () => T : never> extends () => infer R
    ? R
    : never;

type Push<T extends Array<any>, V> = [...T, V];

type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false,
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;

type ObjectToTuples<GivenRecord extends object> = TuplifyUnion<
  {
    [K in keyof GivenRecord]: [GivenRecord[K], any];
  }[keyof GivenRecord]
>;

// Test cases
type Test1 = ObjectToTuples<ExampleInput1>;
const _test1: Test1 = [
  ["b", true],
  ["a", false],
];
type Test2 = ObjectToTuples<ExampleInput2>;
const _test2: Test2 = [
  ["c", true],
  ["a", false],
  ["b", false],
];
type Test3 = ObjectToTuples<ExampleInput3>;
const _test3: Test3 = [
  [["a"], true],
  [["b"], false],
];
