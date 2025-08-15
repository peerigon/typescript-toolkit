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
 * Helper to convert a union to an intersection.
 * This allows us to extract individual members from a union type.
 */
type UnionToIntersection<Union> = (
  Union extends any ? (arg: Union) => void : never
) extends (arg: infer Intersection) => void
  ? Intersection
  : never;

/**
 * Helper to extract one member from a union type.
 * Uses function overload resolution to consistently pick one element.
 */
type PopUnion<Union> =
  UnionToIntersection<
    Union extends any ? () => Union : never
  > extends () => infer Element
    ? Element
    : never;

/**
 * Converts a union of tuples into a fixed-length tuple array.
 * Recursively builds the tuple by extracting one element at a time.
 */
type UnionToTuple<Union, Result extends ReadonlyArray<any> = []> = [
  Union,
] extends [never]
  ? Result
  : PopUnion<Union> extends infer Current
    ? UnionToTuple<Exclude<Union, Current>, readonly [...Result, Current]>
    : never;

/**
 * Converts an object type into a fixed-length array of key-value tuples.
 * Each property of the object becomes a [key, value] tuple in the resulting array.
 * The resulting type is a tuple (not just an array) containing all properties.
 *
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
  ["A", "a"],
  ["B", "b"],
];
type Test2 = ObjectToTuples<ExampleInput2>;
const _test2: Test2 = [
  ["C", "c"],
  ["A", "a"],
  ["B", "b"],
];
type Test3 = ObjectToTuples<ExampleInput3>;
const _test3: Test3 = [];
type Test4 = ObjectToTuples<ExampleInput4>;
const _test4: Test4 = [
  ["A", ["a"]],
  ["B", ["b"]],
];
