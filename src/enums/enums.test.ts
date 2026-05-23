// This test uses @ts-expect-error to test for specific type errors
// Do not remove them as they are assertions on expected type errors

import { describe, expect, it } from "vitest";
import { enums, type Enums } from "./enums.ts";

describe("enums", () => {
  describe("define()", () => {
    describe("with property keys as values", () => {
      const Direction = enums.define({
        North: true,
        South: true,
        East: true,
        West: true,
      });
      type Direction = Enums<typeof Direction>;

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
        expect.assertions(0);
        const processDirection = (_direction: Direction) => {};

        processDirection(Direction.North);
        // @ts-expect-error - Cannot assign arbitrary string
        processDirection("North");
        // @ts-expect-error - Cannot assign number
        processDirection(1);
      });
    });

    it("supports primitive values", () => {
      const MixedEnum = enums.define({
        StringValue: true,
        NumberValue: 42,
        SymbolValue: Symbol("test"),
      });
      type MixedEnum = Enums<typeof MixedEnum>;

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

    it("supports complex values like objects, arrays, and functions", () => {
      const configObject = { name: "config", value: 123 } as const;
      const dataArray = [1, 2, 3] as const;
      const handlerFunction = () => "handler";

      const ComplexEnum = enums.define({
        Object: configObject,
        Array: dataArray,
        Function: handlerFunction,
      });
      type ComplexEnum = Enums<typeof ComplexEnum>;

      expect(ComplexEnum.Object).toBe(configObject);
      expect(ComplexEnum.Array).toBe(dataArray);
      expect(ComplexEnum.Function).toBe(handlerFunction);

      let _complexEnum: ComplexEnum;

      // Should work because we're accessing the value as branded enum
      _complexEnum = ComplexEnum.Object;
      _complexEnum = ComplexEnum.Array;
      _complexEnum = ComplexEnum.Function;

      // Should show a type error because we're accessing the value as a plain object
      // @ts-expect-error - Cannot use direct reference
      _complexEnum = configObject;
      // @ts-expect-error - Cannot use direct reference
      _complexEnum = dataArray;
      // @ts-expect-error - Cannot use direct reference
      _complexEnum = handlerFunction;
    });
  });

  describe("define.branded()", () => {
    const ColorBrand = Symbol("Color");
    const Color = enums.define.branded(ColorBrand, {
      Red: true,
      Green: true,
      Blue: true,
    });
    type Color = Enums<typeof Color>;

    // Status has same values as Color but is not branded
    const Status = enums.define({
      Red: true,
      Green: true,
      Yellow: true,
    });
    type Status = Enums<typeof Status>;

    it("prevents mixing branded enums with same values", () => {
      expect.assertions(0);
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

  describe("parse()", () => {
    describe("with string enum values", () => {
      const Direction = enums.define({
        North: true,
        South: true,
        East: true,
        West: true,
      });
      type Direction = Enums<typeof Direction>;

      it("returns the value when it's a valid enum value", () => {
        const result: Direction = enums.parse(Direction, "North");
        expect(result).toBe("North");
        expect(result).toBe(Direction.North);

        // Type should be narrowed to Direction
        const _direction: Direction = result;
        expect(_direction).toBe(Direction.North);
      });

      it("throws TypeError when value is not in enum", () => {
        let error: unknown;
        try {
          enums.parse(Direction, "Northeast");
        } catch (error_) {
          error = error_;
        }

        expect(error).toMatchInlineSnapshot(
          `[TypeError: Invalid enum value "Northeast". Expected one of: "North", "South", "East", "West"]`,
        );
        expect((error as TypeError).cause).toEqual({
          enum: Direction,
          value: "Northeast",
        });
      });
    });

    describe("with complex values", () => {
      const configObject = { name: "config", value: 123 } as const;
      const dataArray = [1, 2, 3] as const;
      const handlerFunction = () => "handler";

      const ComplexEnum = enums.define({
        Object: configObject,
        Array: dataArray,
        Function: handlerFunction,
      });
      type ComplexEnum = Enums<typeof ComplexEnum>;

      it("returns the exact reference when value matches", () => {
        const objectResult: ComplexEnum = enums.parse(
          ComplexEnum,
          configObject,
        );
        expect(objectResult).toBe(ComplexEnum.Object);
        expect(objectResult).toBe(configObject);

        const arrayResult: ComplexEnum = enums.parse(ComplexEnum, dataArray);
        expect(arrayResult).toBe(ComplexEnum.Array);
        expect(arrayResult).toBe(dataArray);

        const functionResult: ComplexEnum = enums.parse(
          ComplexEnum,
          handlerFunction,
        );
        expect(functionResult).toBe(ComplexEnum.Function);
        expect(functionResult).toBe(handlerFunction);
      });

      it("throws for similar but different objects", () => {
        const similarObject = { name: "config", value: 123 };
        expect(() => enums.parse(ComplexEnum, similarObject)).toThrow(
          TypeError,
        );

        const similarArray = [1, 2, 3];
        expect(() => enums.parse(ComplexEnum, similarArray)).toThrow(TypeError);

        const differentFunction = () => "handler";
        expect(() => enums.parse(ComplexEnum, differentFunction)).toThrow(
          TypeError,
        );
      });
    });

    describe("edge cases", () => {
      it("handles empty enums", () => {
        const EmptyEnum = enums.define({});
        expect(() => enums.parse(EmptyEnum, "anything")).toThrow(TypeError);
        expect(() => enums.parse(EmptyEnum, null)).toThrow(TypeError);
        expect(() => enums.parse(EmptyEnum, undefined)).toThrow(TypeError);
      });
    });
  });

  describe("entries()", () => {
    const Direction = enums.define({
      North: true,
      South: true,
      East: true,
      West: "Wild west",
    });
    type Direction = Enums<typeof Direction>;

    it("returns array of [key, value] tuples", () => {
      const entries = enums.entries(Direction);

      // Preserves insertion orderx
      expect(entries).toEqual([
        ["North", "North"],
        ["South", "South"],
        ["East", "East"],
        ["West", "Wild west"],
      ]);

      // Verify type safety
      const _typedEntries: Array<[keyof typeof Direction, Direction]> = entries;
    });
  });
});
