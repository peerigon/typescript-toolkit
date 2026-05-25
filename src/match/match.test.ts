// This test uses @ts-expect-error to test for specific type errors
// Do not remove them as they are assertions on expected type errors

import { describe, expect, it } from "vitest";
import { enums, type Enums } from "../enums/enums.ts";
import { match } from "./match.ts";

describe("match()", () => {
  const Direction = enums.define({
    Up: "North",
    Down: "South",
  });
  type Direction = Enums<typeof Direction>;

  it("matches enum values", () => {
    const direction = Direction.Up as Direction;
    const matched: string = match(direction).case([
      [Direction.Up, "North"],
      [Direction.Down, "South"],
    ]);
    expect(matched).toBe("North");
  });

  it("requires all enum cases", () => {
    expect.assertions(0);
    match<Direction>(Direction.Up).case(
      // @ts-expect-error Should show a type error here because not all enum cases are covered
      [
        [Direction.Up, "North"],
        // [Direction.Down, "South"],
      ],
    );
  });

  it("allows default case with match.default", () => {
    const matched: boolean = match<Direction>(Direction.Up).case([
      // Should not show a type error here because we're using match.default
      [Direction.Down, false],
      [match.default, true],
    ]);
    expect(matched).toBe(true);
  });

  it("allows a catch case with match.catch for unknown values at runtime", () => {
    const matched: boolean = match("something else" as Direction).case([
      [Direction.Up, false],
      [Direction.Down, false],
      [match.catch, true],
    ]);
    expect(matched).toBe(true);
  });

  it("requires all cases even with match.catch", () => {
    expect.assertions(0);
    match<Direction>(Direction.Up).case(
      // @ts-expect-error Should show a type error here because not all enum cases are covered
      [
        [Direction.Up, false],
        [match.catch, true],
      ],
    );
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
    const matched: "north" | "south" | "default" = match<Direction>(
      Direction.Up,
    ).case([
      [Direction.Up, "north"],
      [Direction.Down, "south"],
      [match.default, "default"],
    ]);
    expect(matched).toBe("north");
  });

  it("works with complex value and result types", () => {
    const ComplexValue = {
      Object: {
        a: true,
      },
      Array: ["a"],
    } as const;
    type ComplexValue = (typeof ComplexValue)[keyof typeof ComplexValue];

    const matched: () => string = match<ComplexValue>(ComplexValue.Array).case([
      [ComplexValue.Object, () => "object"],
      [ComplexValue.Array, () => "array"],
      [match.default, () => "default"],
    ]);
    expect(matched()).toBe("array");
  });

  it("shows a type error when a case is covered that doesn't exist", () => {
    const matched: string = match<"a">("a").case(
      // @ts-expect-error Should show a type error here because "b" case doesn't exist
      [
        ["a", "a"],
        ["b", "b"],
      ],
    );
    expect(matched).toBe("a");
  });

  it("shows a type error when the `undefined` case is not covered", () => {
    const value = "a" as "a" | undefined;
    const matched: string = match(value).case(
      // @ts-expect-error Should show a type error here because the undefined case is not covered
      [["a", "a"]],
    );
    expect(matched).toBe("a");
  });

  it("allows to cover the undefined case", () => {
    const value = undefined as "a" | undefined;
    const matched: string = match(value).case([
      ["a", "a"],
      [undefined, "undefined"],
    ]);
    expect(matched).toBe("undefined");
  });

  it("correctly matches NaN values (using Object.is)", () => {
    const matched: string = match(Number.NaN).case([
      [Number.NaN, "found NaN"],
      [match.default, "not NaN"],
    ]);
    expect(matched).toBe("found NaN");
  });

  it("distinguishes between +0 and -0 (using Object.is)", () => {
    // Test positive zero (0 and +0 are the same value)
    const resultPositive: string = match(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
      +0,
    ).case([
      [-0, "negative zero"],
      [0, "positive zero"],
    ]);
    expect(resultPositive).toBe("positive zero");

    // Test negative zero
    const resultNegative: string = match(-0).case([
      [0, "positive zero"],
      [-0, "negative zero"],
    ]);
    expect(resultNegative).toBe("negative zero");
  });
});
