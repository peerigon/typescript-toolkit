import { describe, expect, it } from "vitest";
import { match } from "../match/match.ts";
import { Enum } from "./enum.ts";

describe("Enum.define()", () => {
  describe("with property keys as values", () => {
    const Direction = Enum.define({
      North: true,
      South: true,
      East: true,
      West: true,
    });
    type Direction = Enum<typeof Direction>;

    it("creates an enum object with key names as values", () => {
      expect(Direction.North).toBe("North");
      expect(Direction.South).toBe("South");
      expect(Direction.East).toBe("East");
      expect(Direction.West).toBe("West");
    });

    it("creates a frozen enum object", () => {
      expect(Object.isFrozen(Direction)).toBe(true);
    });

    it("allows using enum types", () => {
      const getOpposite = (direction: Direction): Direction => {
        switch (direction) {
          case Direction.North: {
            return Direction.South;
          }
          case Direction.South: {
            return Direction.North;
          }
          case Direction.East: {
            return Direction.West;
          }
          case Direction.West: {
            return Direction.East;
          }
          default: {
            throw new Error("Invalid direction");
          }
        }
      };

      expect(getOpposite(Direction.North)).toBe(Direction.South);
      expect(getOpposite(Direction.East)).toBe(Direction.West);
    });

    it("prevents assigning arbitrary strings", () => {
      const processDirection = (_direction: Direction) => {};

      processDirection(Direction.North);
      // @ts-expect-error - Cannot assign arbitrary string
      processDirection("North");
      // @ts-expect-error - Cannot assign number
      processDirection(1);
    });

    // TODO: Make this work, should show a type error
    // TODO: Maybe SomeEnum.match(). Then match.default and match.catch could also be used together
    it("works with match()", () => {
      const arrow = (direction: Direction) => {
        return match(direction, {
          North: "up",
          // South: "down",
          East: "right",
          West: "left",
        });
      };

      // const arrow = match(direction, {
      //   North: "up",
      //   // South: "down",
      //   East: "right",
      //   West: "left",
      // });

      expect(arrow).toBe("up");
    });
  });

  it("supports mixed ordinal types", () => {
    const MixedEnum = Enum.define({
      StringValue: true,
      NumberValue: 42,
      SymbolValue: Symbol("test"),
    });
    type MixedEnum = Enum<typeof MixedEnum>;

    expect(MixedEnum.StringValue).toBe("StringValue");
    expect(MixedEnum.NumberValue).toBe(42);
    expect(typeof MixedEnum.SymbolValue).toBe("symbol");

    const processMixed = (_value: MixedEnum) => {};
    processMixed(MixedEnum.StringValue);
    processMixed(MixedEnum.NumberValue);
    processMixed(MixedEnum.SymbolValue);
    // @ts-expect-error - Cannot mix values from the enum
    processMixed("StringValue");
    // @ts-expect-error - Cannot mix values from the enum
    processMixed(42);
  });
});

describe("Enum.define.branded()", () => {
  const ColorBrand = Symbol("Color");
  const Color = Enum.define.branded(ColorBrand, {
    Red: true,
    Green: true,
    Blue: true,
  });
  type Color = Enum<typeof Color>;

  // Status has same values as Color but is not branded
  const Status = Enum.define({
    Red: true,
    Green: true,
    Yellow: true,
  });
  type Status = Enum<typeof Status>;

  it("prevents mixing branded enums with same values", () => {
    const processColor = (_color: Color) => {};
    const processStatus = (_status: Status) => {};

    processColor(Color.Red);
    processColor(Color.Green);
    // @ts-expect-error - Cannot use Status in place of Color
    processColor(Status.Red);
    // @ts-expect-error - Cannot use Status in place of Color
    processColor(Status.Green);
    // @ts-expect-error - Cannot use Status.Yellow which doesn't exist in Color
    processColor(Status.Yellow);

    processStatus(Status.Red);
    processStatus(Status.Yellow);
    // @ts-expect-error - Cannot use Color in place of Status
    processStatus(Color.Red);
    // @ts-expect-error - Cannot use Color.Blue which doesn't exist in Status
    processStatus(Color.Blue);
  });

  it("creates a frozen enum object", () => {
    expect(Object.isFrozen(Color)).toBe(true);
  });
});
