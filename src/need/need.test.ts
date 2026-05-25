import { describe, expect, expectTypeOf, it } from "vitest";
import { need } from "./need.ts";

describe("need()", () => {
  it("returns the value when it is not null or undefined", () => {
    expect(need("hello")).toBe("hello");
    expect(need(42)).toBe(42);
    expect(need(true)).toBe(true);
    expect(need(false)).toBe(false);
    expect(need(0)).toBe(0);
    expect(need("")).toBe("");
    expect(need([])).toEqual([]);
    expect(need({})).toEqual({});
  });

  it("throws TypeError when value is null", () => {
    expect(() => need(null)).toThrow(TypeError);
    expect(() => need(null)).toThrow(
      "Expected value to be defined, but got null",
    );
  });

  it("throws TypeError when value is undefined", () => {
    expect(() => need(undefined)).toThrow(TypeError);
    expect(() => need(undefined)).toThrow(
      "Expected value to be defined, but got undefined",
    );
  });

  it("preserves the original type for non-nullable values", () => {
    const stringValue = "test" as string | null;
    expectTypeOf(need(stringValue)).toEqualTypeOf<string>();
    expect(need(stringValue)).toBe("test");

    const numberValue = 123 as number | undefined;
    expectTypeOf(need(numberValue)).toEqualTypeOf<number>();
    expect(need(numberValue)).toBe(123);
  });

  it("preserves falsy but defined values", () => {
    expect(need(0)).toBe(0);
    expect(need(false)).toBe(false);
    expect(need("")).toBe("");
    expect(need(Number.NaN)).toBeNaN();
  });

  describe("error message formatting", () => {
    it("includes the actual value in default error message for null", () => {
      expect(() => need(null)).toThrow(
        "Expected value to be defined, but got null",
      );
    });

    // This catches errors when the value is stringified for the default error message
    // In a previous implementation, we were interpolating `${value}` which would throw
    // an error if the value is not stringifyable.
    it("handles values well that are not stringifyable", () => {
      expect(() => need(Symbol("test"))).not.toThrow();
    });

    it("includes the actual value in default error message for undefined", () => {
      expect(() => need(undefined)).toThrow(
        "Expected value to be defined, but got undefined",
      );
    });

    it("allows custom error messages to override default formatting", () => {
      const customMsg = "Value must not be empty";
      expect(() => need(null, customMsg)).toThrow(customMsg);
      expect(() => need(undefined, customMsg)).toThrow(customMsg);
    });
  });
});
