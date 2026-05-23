import { describe, expect, it } from "vitest";
import { assert } from "./assert.js";

describe("assert()", () => {
  describe("when value is null or undefined", () => {
    it("throws for null", () => {
      expect(() => assert(null)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected neither null nor undefined, but got null]`,
      );
    });

    it("throws for undefined", () => {
      expect(() => assert(undefined)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected neither null nor undefined, but got undefined]`,
      );
    });
  });

  describe("when value is something else", () => {
    it("does not throw for non-nullish values", () => {
      expect(() => assert(1)).not.toThrow();
      expect(() => assert("hello")).not.toThrow();
      expect(() => assert(true)).not.toThrow();
      expect(() => assert(false)).not.toThrow();
      expect(() => assert([])).not.toThrow();
      expect(() => assert({})).not.toThrow();
      expect(() => assert(() => {})).not.toThrow();
      expect(() => assert(0)).not.toThrow();
      expect(() => assert("")).not.toThrow();
    });

    it("preserves the original value after assertion", () => {
      const value = "test";
      assert(value);
      // Should not show a type error
      const _sameValue: "test" = value;
    });
  });

  describe("when message is provided", () => {
    it("uses custom message", () => {
      const customMessage = "Custom assertion error";
      expect(() => assert(null, customMessage)).toThrow(customMessage);
      expect(() => assert(undefined, customMessage)).toThrow(customMessage);
    });

    it("calls the function message when provided", () => {
      const messageFn = () => "Dynamic error message";
      expect(() => assert(undefined, messageFn)).toThrow(
        "Dynamic error message",
      );
    });

    it("uses default message when false is provided", () => {
      expect(() => assert(undefined, false)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected neither null nor undefined, but got undefined]`,
      );
    });
  });

  describe("type narrowing", () => {
    it("narrows type from potentially nullable to non-nullable", () => {
      // This test verifies the TypeScript type assertion behavior
      // Using `let` so that TypeScript doesn't infer const types
      // eslint-disable-next-line prefer-const
      let potentiallyNull: string | null = "hello";
      assert(potentiallyNull);
      // After assertion, TypeScript should know potentiallyNull is string, not string | null
      // This is tested by compilation, not runtime behavior
      const _certainlyAString: string = potentiallyNull; // This should not cause TypeScript error
    });
  });

  describe("falsy values that should not throw", () => {
    it("does not throw for false", () => {
      expect(() => assert(false)).not.toThrow();
    });

    it("does not throw for 0", () => {
      expect(() => assert(0)).not.toThrow();
    });

    it("does not throw for negative zero", () => {
      expect(() => assert(-0)).not.toThrow();
    });

    it("does not throw for empty string", () => {
      expect(() => assert("")).not.toThrow();
    });

    it("does not throw for NaN", () => {
      expect(() => assert(Number.NaN)).not.toThrow();
    });
  });

  describe("error types", () => {
    it("throws TypeError instances", () => {
      expect(() => assert(null)).toThrow(TypeError);
      expect(() => assert(null)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected neither null nor undefined, but got null]`,
      );
    });

    it("preserves stack trace", () => {
      expect(() => assert(undefined, "Test error")).toThrow(
        expect.objectContaining({
          stack: expect.stringContaining("assert.test.ts"),
        }),
      );
    });
  });
});

describe("assert.truthy()", () => {
  describe("when value is falsy", () => {
    it("throws for false", () => {
      expect(() => assert.truthy(false)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, but got false]`,
      );
    });

    it("throws for 0", () => {
      expect(() => assert.truthy(0)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, but got 0]`,
      );
    });

    it("throws for empty string", () => {
      expect(() => assert.truthy("")).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, but got ""]`,
      );
    });

    it("throws for null", () => {
      expect(() => assert.truthy(null)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, but got null]`,
      );
    });

    it("throws for undefined", () => {
      expect(() => assert.truthy(undefined)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, but got undefined]`,
      );
    });

    it("throws for NaN", () => {
      expect(() =>
        assert.truthy(Number.NaN),
      ).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, but got NaN]`,
      );
    });
  });

  describe("when value is truthy", () => {
    it("does not throw for truthy values", () => {
      expect(() => assert.truthy(1)).not.toThrow();
      expect(() => assert.truthy("hello")).not.toThrow();
      expect(() => assert.truthy(true)).not.toThrow();
      expect(() => assert.truthy([])).not.toThrow();
      expect(() => assert.truthy({})).not.toThrow();
      expect(() => assert.truthy(() => {})).not.toThrow();
    });
  });

  describe("when message is provided", () => {
    it("uses custom message when provided", () => {
      const customMessage = "Custom truthy assertion error";
      expect(() => assert.truthy(false, customMessage)).toThrow(customMessage);
      expect(() => assert.truthy(0, customMessage)).toThrow(customMessage);
    });

    it("calls the function message when provided", () => {
      const messageFn = () => "Dynamic truthy error message";
      expect(() => assert.truthy(false, messageFn)).toThrow(
        "Dynamic truthy error message",
      );
    });

    it("uses default message when false is provided", () => {
      expect(() =>
        assert.truthy(undefined, false),
      ).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, but got undefined]`,
      );
    });
  });

  describe("type narrowing", () => {
    it("narrows type from potentially falsy to truthy", () => {
      // eslint-disable-next-line prefer-const
      let potentiallyFalsy: string | null | undefined = "hello";
      assert.truthy(potentiallyFalsy);
      // After assertion, TypeScript should know potentiallyFalsy is string
      const _length: number = potentiallyFalsy.length; // This should not cause TypeScript error
    });
  });
});
