import { describe, expect, expectTypeOf, it } from "vitest";
import { isPlainObject } from "./is-plain-object.ts";

describe("isPlainObject()", () => {
  it("returns true for plain objects", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
  });

  it("returns false for non-objects and non-plain objects", () => {
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject(42)).toBe(false);
    expect(isPlainObject("string")).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(new Map())).toBe(false);
    expect(isPlainObject(Object.create({}))).toBe(false);
  });

  it("narrows to Record<string, unknown>", () => {
    const value: unknown = { a: 1 };

    if (isPlainObject(value)) {
      expectTypeOf(value).toEqualTypeOf<Record<string, unknown>>();
    }
  });
});
