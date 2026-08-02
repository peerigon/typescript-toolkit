import { describe, expect, expectTypeOf, it } from "vitest";
import { isError } from "./is-error.ts";

describe("isError()", () => {
  it("returns true for Error instances", () => {
    expect(isError(new Error("boom"))).toBe(true);
    expect(isError(new TypeError("boom"))).toBe(true);
  });

  it("returns false for non-errors", () => {
    expect(isError(null)).toBe(false);
    expect(isError(undefined)).toBe(false);
    expect(isError("boom")).toBe(false);
    expect(isError({ message: "boom" })).toBe(false);
    expect(isError({ name: "Error", message: "boom" })).toBe(false);
    expect(
      isError({
        name: "Error",
        message: "boom",
        stack: "Error: boom",
      }),
    ).toBe(false);
  });

  it("narrows to Error", () => {
    const value: unknown = new Error("boom");

    if (isError(value)) {
      expectTypeOf(value).toEqualTypeOf<Error>();
    }
  });
});
