import { describe, expect, it } from "vitest";
import { assert } from "./assert.js";

describe("assert()", () => {
  describe("when value is null, undefined, or false", () => {
    it("throws for null", () => {
      expect(() => assert(null)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, got null]`,
      );
    });

    it("throws for undefined", () => {
      expect(() => assert(undefined)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, got undefined]`,
      );
    });

    it("throws for false", () => {
      expect(() => assert(false)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, got false]`,
      );
    });
  });

  describe("when value is something else", () => {
    it("does not throw for non-null, non-undefined, non-false values", () => {
      expect(() => assert(1)).not.toThrow();
      expect(() => assert("hello")).not.toThrow();
      expect(() => assert(true)).not.toThrow();
      expect(() => assert([])).not.toThrow();
      expect(() => assert({})).not.toThrow();
      expect(() => assert(() => {})).not.toThrow();
      expect(() => assert(0)).not.toThrow(); // 0 is falsy but not null/undefined/false
      expect(() => assert("")).not.toThrow(); // empty string is falsy but not null/undefined/false
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
      expect(() => assert(false, customMessage)).toThrow(customMessage);
    });

    it("calls the function message when provided", () => {
      const messageFn = () => "Dynamic error message";
      expect(() => assert(undefined, messageFn)).toThrow(
        "Dynamic error message",
      );
    });

    it("uses default message when false is provided", () => {
      expect(() => assert(undefined, false)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, got undefined]`,
      );
      expect(() => assert(false, false)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, got false]`,
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
      const _length: number = potentiallyNull.length; // This should not cause TypeScript error
    });

    it("narrows type from boolean to true", () => {
      // Using `let` so that TypeScript doesn't infer const types
      // eslint-disable-next-line prefer-const
      let potentiallyFalse = false;
      try {
        assert(potentiallyFalse);
        // After assertion, TypeScript should know potentiallyFalse is true
        // This is tested by compilation, not runtime behavior
        const _test: true = potentiallyFalse;
      } catch {
        // Do nothing
      }
    });
  });

  describe("falsy values that should not throw", () => {
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

    it("does not throw for negative zero", () => {
      expect(() => assert(-0)).not.toThrow();
    });
  });

  describe("error types", () => {
    it("throws TypeError instances", () => {
      try {
        assert(null);
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error).toBeInstanceOf(TypeError);
        expect(error.message).toMatchInlineSnapshot(
          `"Assertion failed: expected truthy value, got null"`,
        );
      }
    });

    it("preserves stack trace", () => {
      try {
        assert(undefined, "Test error");
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.stack).toContain("assert.test.ts");
      }
    });
  });
});

describe("assert.truthy()", () => {
  describe("when value is falsy", () => {
    it("throws for false", () => {
      expect(() => assert.truthy(false)).toThrow(
        "Assertion failed: expected truthy value, got false",
      );
    });

    it("throws for 0", () => {
      expect(() => assert.truthy(0)).toThrow(
        "Assertion failed: expected truthy value, got 0",
      );
    });

    it("throws for empty string", () => {
      expect(() => assert.truthy("")).toThrow(
        "Assertion failed: expected truthy value, got ",
      );
    });

    it("throws for null", () => {
      expect(() => assert.truthy(null)).toThrow(
        "Assertion failed: expected truthy value, got null",
      );
    });

    it("throws for undefined", () => {
      expect(() => assert.truthy(undefined)).toThrow(
        "Assertion failed: expected truthy value, got undefined",
      );
    });

    it("throws for NaN", () => {
      expect(() => assert.truthy(Number.NaN)).toThrow(
        "Assertion failed: expected truthy value, got NaN",
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
      expect(() => assert(undefined, false)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, got undefined]`,
      );
      expect(() => assert(false, false)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Assertion failed: expected truthy value, got false]`,
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

    it("narrows type from number to non-zero", () => {
      // eslint-disable-next-line prefer-const
      let potentiallyZero = 42;
      assert.truthy(potentiallyZero);
      // After assertion, TypeScript should know potentiallyZero is non-zero
      const _test: number = potentiallyZero; // This should not cause TypeScript error
    });
  });
});
