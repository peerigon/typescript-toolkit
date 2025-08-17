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

  describe("record-based cases", () => {
    it("matches string values", () => {
      const value = "a" as "a" | "b";
      const result: boolean = match<"a" | "b">(value).case({
        a: true,
        b: false,
      });
      expect(result).toBe(true);
    });

    it("matches number values", () => {
      const value = 1 as 1 | 2;
      const result: string = match<1 | 2>(value).case({
        1: "one",
        2: "two",
      });
      expect(result).toBe("one");
    });

    it("matches symbol values", () => {
      const sym1 = Symbol("one");
      const sym2 = Symbol("two");
      const value = sym1 as typeof sym1 | typeof sym2;
      const result: string = match<typeof sym1 | typeof sym2>(value).case({
        [sym1]: "symbol one",
        [sym2]: "symbol two",
      });
      expect(result).toBe("symbol one");
    });

    it("shows a type error and throws a runtime error for missing case", () => {
      expect(() => {
        const value = "a";

        match(value).case({
          // @ts-expect-error Should show a type error here because not all cases are covered
          b: false,
        });
      }).toThrow('No match found for "a". Expected one of: "b"');
    });

    it("allows default case with match.default", () => {
      const value = "a";
      const result: boolean = match<"a" | "b">(value).case({
        // Should not show a type error here because we're using match.default
        b: false,
        [match.default]: true,
      });
      expect(result).toBe(true);
    });

    it("allows a catch case with match.catch for unknown values at runtime", () => {
      const value = "a";
      const result: boolean = match<"a" | "b">(value).case({
        a: true,
        b: false,
        [match.catch]: false,
      });
      expect(result).toBe(true);
    });

    it("requires all cases even with match.catch", () => {
      const value = "a";

      expect(() => {
        match<"a" | "b">(value).case(
          // @ts-expect-error Should show a type error here because catch doesn't free us from implementing all cases
          {
            a: true,
            [match.catch]: false,
          },
        );
      }).not.toThrow();
    });

    it("rejects branded types like enums", () => {
      match(Direction.Up).case(
        // This should cause a type error because branded types are not allowed
        // @ts-expect-error Branded types are not allowed
        {
          [Direction.Up]: "up",
          [Direction.Down]: "down",
        },
      );
    });

    it("narrows the result type", () => {
      const result: "one" | "two" | "default" = match<1 | 2>(1).case({
        1: "one",
        2: "two",
        [match.default]: "default",
      });
      expect(result).toBe("one");
    });

    it("works with complex result types", () => {
      const result: () => string = match<1 | 2>(1).case({
        1: () => "one",
        2: () => "two",
        [match.default]: () => "default",
      });
      expect(result()).toBe("one");
    });
  });

  describe("tuple-based cases", () => {
    it("matches enum values with tuples", () => {
      const direction = Direction.Up as Direction;
      const result: string = match(direction).case([
        [Direction.Up, "North"],
        [Direction.Down, "South"],
      ]);
      expect(result).toBe("North");
    });

    it("requires all enum cases with tuples", () => {
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

    it("doesn't allow tuples when basic types are used", () => {
      expect(() => {
        match<"a" | "b">("a").case(
          // @ts-expect-error Should show a type error here because the record notation should be used instead of tuples
          [
            ["b", false],
            [match.default, true],
          ],
        );
      })
        // It won't throw a runtime error but it's not supported in the type notation
        .not.toThrow();
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

      const result: () => string = match<ComplexValue>(ComplexValue.Array).case(
        [
          [ComplexValue.Object, () => "object"],
          [ComplexValue.Array, () => "array"],
          [match.default, () => "default"],
        ],
      );
      expect(result()).toBe("array");
    });
  });
});
