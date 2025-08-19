// This test uses @ts-expect-error to test for specific type errors
// Do not remove them as they are assertions on expected type errors

import { describe, expect, it } from "vitest";
import { enums, type Enums } from "../enums/enums";
import { match } from "./match";

describe("match()", () => {
  const Direction = enums.define({
    Up: "North",
    Down: "South",
  });
  type Direction = Enums<typeof Direction>;

  it("matches enum values", () => {
    const direction = Direction.Up as Direction;
    const result: string = match(direction).case([
      [Direction.Up, "North"],
      [Direction.Down, "South"],
    ]);
    expect(result).toBe("North");
  });

  it("requires all enum cases", () => {
    expect(() => {
      match<Direction>(Direction.Up).case(
        // @ts-expect-error Should show a type error here because not all enum cases are covered
        [
          [Direction.Up, "North"],
          // [Direction.Down, "South"],
        ],
      );
    }).not.toThrow();
  });

  it("allows default case with match.default", () => {
    const result: boolean = match<Direction>(Direction.Up).case([
      // Should not show a type error here because we're using match.default
      [Direction.Down, false],
      [match.default, true],
    ]);
    expect(result).toBe(true);
  });

  it("allows a catch case with match.catch for unknown values at runtime", () => {
    const result: boolean = match("something else" as Direction).case([
      [Direction.Up, false],
      [Direction.Down, false],
      [match.catch, true],
    ]);
    expect(result).toBe(true);
  });

  it("requires all cases even with match.catch", () => {
    expect(() => {
      match<Direction>(Direction.Up).case(
        // @ts-expect-error Should show a type error here because not all enum cases are covered
        [
          [Direction.Up, false],
          [match.catch, true],
        ],
      );
    }).not.toThrow();
  });

  it("requires at least one case in tuple form", () => {
    expect(() => {
      match<Direction>(Direction.Up).case(
        // @ts-expect-error Should show a type error here because there must be at least one default case
        [],
      );
    }).toThrowErrorMatchingInlineSnapshot(
      `[TypeError: Expected value to be defined, but got undefined]`,
    );
  });

  it("narrows the result type", () => {
    const result: "north" | "south" | "default" = match<Direction>(
      Direction.Up,
    ).case([
      [Direction.Up, "north"],
      [Direction.Down, "south"],
      [match.default, "default"],
    ]);
    expect(result).toBe("north");
  });

  it("works with complex value and result types", () => {
    const ComplexValue = {
      Object: {
        a: true,
      },
      Array: ["a"],
    } as const;
    type ComplexValue = (typeof ComplexValue)[keyof typeof ComplexValue];

    const result: () => string = match<ComplexValue>(ComplexValue.Array).case([
      [ComplexValue.Object, () => "object"],
      [ComplexValue.Array, () => "array"],
      [match.default, () => "default"],
    ]);
    expect(result()).toBe("array");
  });

  it("shows a type error when a case is covered that doesn't exist", () => {
    const result: string = match<"a">("a").case(
      // @ts-expect-error Should show a type error here because "b" case doesn't exist
      [
        ["a", "a"],
        ["b", "b"],
      ],
    );
    expect(result).toBe("a");
  });

  it("shows a type error when the `undefined` case is not covered", () => {
    const value = "a" as "a" | undefined;
    const result: string = match(value).case(
      // @ts-expect-error Should show a type error here because the undefined case is not covered
      [["a", "a"]],
    );
    expect(result).toBe("a");
  });

  it("allows to cover the undefined case", () => {
    const value = undefined as "a" | undefined;
    const result: string = match(value).case([
      ["a", "a"],
      [undefined, "undefined"],
    ]);
    expect(result).toBe("undefined");
  });
});
