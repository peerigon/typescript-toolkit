// Example1
type ExampleInput1 = {
  B: "b";
  A: "a";
};
type ExpectedOutput1 = [["A", "a"], ["B", "b"]];

// Example2
type ExampleInput2 = {
  A: "a";
  B: "b";
  C: "c";
};
type ExpectedOutput2 = [["A", "a"], ["B", "b"], ["C", "c"]];

// Example3
type ExampleInput3 = {};
type ExpectedOutput3 = [];

// Example4
type ExampleInput4 = {
  A: ["a"];
  B: ["b"];
};
type ExpectedOutput4 = [["A", ["a"]], ["B", ["b"]]];

// TODO: Implement a type helper that converts the object into a fixed-length array of tuples. Each property key should have a distinct, predictable position in the array.

/**
 * Converts a union type into an intersection type.
 * This utility is used to extract individual members from a union.
 * @example UnionToIntersection<'a' | 'b'> = 'a' & 'b'
 */
type UnionToIntersection<Union> = (
  Union extends any ? (arg: Union) => void : never
) extends (arg: infer Intersection) => void
  ? Intersection
  : never;

/**
 * Converts a union type into a tuple type with a deterministic order.
 * Uses TypeScript's internal ordering to extract union members one by one.
 * @param Union - The union type to convert
 * @param Accumulator - Internal accumulator for building the result tuple
 * @example UnionToTuple<'a' | 'b' | 'c'> = ['a', 'b', 'c'] (order may vary)
 */
type UnionToTuple<Union, Accumulator extends Array<any> = []> = [
  Union,
] extends [never]
  ? Accumulator
  : UnionToIntersection<
        Union extends any ? (arg: Union) => Union : never
      > extends (arg: infer FirstElement) => any
    ? UnionToTuple<Exclude<Union, FirstElement>, [FirstElement, ...Accumulator]>
    : Accumulator;

/**
 * Converts an object type into a fixed-length array of key-value tuples.
 * Each property of the object becomes a [key, value] tuple in the resulting array.
 * The order is deterministic based on TypeScript's internal union ordering.
 * @param ObjectType - The object type to convert
 * @example ObjectToTuples<{A: 'a', B: 'b'}> = [['A', 'a'], ['B', 'b']]
 */
type ObjectToTuples<ObjectType extends object> = UnionToTuple<
  {
    [Key in keyof ObjectType]: [Key, ObjectType[Key]];
  }[keyof ObjectType]
>;

// Test cases
type Test1 = ObjectToTuples<ExampleInput1>;
const _test1: Test1 = [
  ["B", "b"],
  ["A", "a"],
];
type Test2 = ObjectToTuples<ExampleInput2>;
const _test2: Test2 = [
  ["A", "a"],
  ["B", "b"],
  ["C", "c"],
];
type Test3 = ObjectToTuples<ExampleInput3>;
const _test3: Test3 = [];
type Test4 = ObjectToTuples<ExampleInput4>;
const _test4: Test4 = [
  ["A", ["a"]],
  ["B", ["b"]],
];
