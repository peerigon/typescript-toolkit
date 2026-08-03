import { describe, expect, expectTypeOf, it } from "vitest";
import { assertNever } from "./assert-never.js";

describe("assertNever()", () => {
  it("throws for any given value", () => {
    expect(() =>
      assertNever("unexpected" as never),
    ).toThrowErrorMatchingInlineSnapshot(
      `[TypeError: Unexpected value: "unexpected"]`,
    );
  });

  it("throws for objects", () => {
    expect(() =>
      assertNever({ type: "unknown" } as never),
    ).toThrowErrorMatchingInlineSnapshot(
      `[TypeError: Unexpected value: {"type":"unknown"}]`,
    );
  });

  it("uses custom message when provided", () => {
    expect(() =>
      assertNever("unexpected" as never, "Custom assertion error"),
    ).toThrow("Custom assertion error");
  });

  it("calls the function message when provided", () => {
    const messageFn = () => "Dynamic error message";
    expect(() => assertNever("unexpected" as never, messageFn)).toThrow(
      "Dynamic error message",
    );
  });

  describe("exhaustiveness checking", () => {
    type Direction = "down" | "up";

    const describeDirection = (direction: Direction): string => {
      switch (direction) {
        case "up": {
          return "going up";
        }
        case "down": {
          return "going down";
        }
        default: {
          return assertNever(direction);
        }
      }
    };

    it("handles every case without reaching the default branch", () => {
      expect(describeDirection("up")).toBe("going up");
      expect(describeDirection("down")).toBe("going down");
    });

    it("only accepts a value of type never", () => {
      expectTypeOf(assertNever).parameter(0).toEqualTypeOf<never>();
    });
  });
});
