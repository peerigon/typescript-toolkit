import { describe, expect, it } from "vitest";
import { result } from "../result/result.ts";
import { unwrap } from "./unwrap.ts";

describe("unwrap()", () => {
  describe("with different values", () => {
    it("returns a string", () => {
      const resultValue: "hello" = unwrap("hello");
      expect(resultValue).toBe("hello");
    });

    it("returns a number", () => {
      const resultValue: 42 = unwrap(42);
      expect(resultValue).toBe(42);
    });

    it("returns a boolean", () => {
      const resultValue: true = unwrap(true);
      expect(resultValue).toBe(true);
    });

    it("returns an object", () => {
      const object = { key: "value" };
      const resultValue: { key: string } = unwrap(object);
      expect(resultValue).toBe(object);
    });

    it("returns an array", () => {
      const array = [1, 2, 3];
      const resultValue: Array<number> = unwrap(array);
      expect(resultValue).toBe(array);
    });

    it("returns falsy values", () => {
      expect(unwrap(0)).toBe(0);
      expect(unwrap("")).toBe("");
      expect(unwrap(false)).toBe(false);
    });

    it("returns functions", () => {
      const func = () => "test";
      const resultValue = unwrap(func);
      expect(resultValue).toBe(func);
    });

    it("returns symbols", () => {
      const sym = Symbol("test");
      const resultValue = unwrap(sym);
      expect(resultValue).toBe(sym);
    });

    it("returns bigints", () => {
      const bigIntValue = 123n;
      const resultValue = unwrap(bigIntValue);
      expect(resultValue).toBe(bigIntValue);
    });
  });

  describe("with undefined", () => {
    it("throws when no fallback is provided", () => {
      expect(() => unwrap(undefined)).toThrow(TypeError);
      expect(() => unwrap(undefined)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Cannot unwrap: Value is undefined]`,
      );
    });

    it("returns the fallback when a fallback is provided", () => {
      const resultValue: "fallback" = unwrap(undefined, "fallback");
      expect(resultValue).toBe("fallback");
    });
  });

  describe("with null", () => {
    it("throws when no fallback is provided", () => {
      expect(() => unwrap(null)).toThrow(TypeError);
      expect(() => unwrap(null)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Cannot unwrap: Value is null]`,
      );
    });

    it("returns the fallback when a fallback is provided", () => {
      const resultValue: "fallback" = unwrap(null, "fallback");
      expect(resultValue).toBe("fallback");
    });
  });

  describe("from result.success()", () => {
    it("returns data", () => {
      const success = result.success("test data");
      const unwrapped: string = unwrap(success);
      expect(unwrapped).toBe("test data");
    });

    it("returns data even when data is undefined", () => {
      const success = result.success(undefined);
      const unwrapped: undefined = unwrap(success);
      expect(unwrapped).toBe(undefined);
    });
  });

  describe("from result.error()", () => {
    it("throws when there is no data and no fallback", () => {
      const error = result.error(new Error("test error"));
      expect(() => unwrap(error)).toThrow(TypeError);
      expect(() => unwrap(error)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Cannot unwrap: Result.Error("test error") is not a success and there is no fallback]`,
      );
    });

    it("includes the Result instance as cause in the thrown TypeError", () => {
      const originalError = new Error("test error");
      const errorResult = result.error(originalError);

      expect(() => unwrap(errorResult)).toThrow(
        expect.objectContaining({
          cause: errorResult,
        }),
      );
    });

    it("returns the fallback when there is no data and a fallback is provided", () => {
      const error = result.error(new Error("test error"));
      const unwrapped: "fallback" = unwrap(error, "fallback");
      expect(unwrapped).toBe("fallback");
    });

    it("returns the fallback when there is data and a fallback is provided", () => {
      const error = new Error("test error");
      const errorResult = result.error(error, { data: "test data" });
      const unwrapped: "fallback" = unwrap(errorResult, "fallback");
      expect(unwrapped).toBe("fallback");
    });
  });

  describe("from result.success() with pending state", () => {
    it("returns data", () => {
      const successData = result.success("test data");
      const unwrapped = unwrap(successData);
      expect(unwrapped).toBe("test data");
    });

    it("returns data even when data is undefined", () => {
      const resultValue = result.success(undefined);
      const unwrapped = unwrap(resultValue);
      expect(unwrapped).toBe(undefined);
    });
  });

  describe("from result.pending()", () => {
    it("throws when there is no data and no fallback", () => {
      const pendingData = result.pending();
      expect(() => unwrap(pendingData)).toThrow(TypeError);
      expect(() => unwrap(pendingData)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Cannot unwrap: Result.Pending() is not a success and there is no fallback]`,
      );
    });

    it("includes the Result instance as cause when throwing for pending without data", () => {
      const pendingData = result.pending();

      expect(() => unwrap(pendingData)).toThrow(
        expect.objectContaining({
          cause: pendingData,
        }),
      );
    });

    it("returns data when there is data", () => {
      const pendingData = result.pending({ data: "test data" });
      const unwrapped = unwrap(pendingData);
      expect(unwrapped).toBe("test data");
    });

    it("returns the fallback when there is no data and a fallback is provided", () => {
      const pendingData = result.pending();
      const unwrapped = unwrap(pendingData, "fallback");
      expect(unwrapped).toBe("fallback");
    });
  });

  describe("from Promise.allSettled()", () => {
    it("returns the value when status is fulfilled", () => {
      const settled: PromiseFulfilledResult<string> = {
        status: "fulfilled",
        value: "done",
      };
      const unwrapped: string = unwrap(settled);
      expect(unwrapped).toBe("done");
    });

    it("returns undefined when fulfilled value is undefined", () => {
      const settled: PromiseFulfilledResult<undefined> = {
        status: "fulfilled",
        value: undefined,
      };
      expect(unwrap(settled)).toBe(undefined);
    });

    it("throws the reason when status is rejected and no fallback is provided", () => {
      const reason = new Error("rejected");
      const settled: PromiseRejectedResult = {
        status: "rejected",
        reason,
      };

      expect(() => unwrap(settled)).toThrow(reason);
    });

    it("throws non-Error reasons when status is rejected", () => {
      const settled: PromiseRejectedResult = {
        status: "rejected",
        reason: "failure",
      };

      expect(() => unwrap(settled)).toThrow("failure");
    });

    it("returns the fallback when status is rejected and a fallback is provided", () => {
      const settled: PromiseRejectedResult = {
        status: "rejected",
        reason: new Error("rejected"),
      };
      const unwrapped: "fallback" = unwrap(settled, "fallback");
      expect(unwrapped).toBe("fallback");
    });
  });

  describe("from result.error() with pending state", () => {
    it("throws when there is no data and no fallback", () => {
      const errorData = result.error(new Error("test error"));
      expect(() => unwrap(errorData)).toThrow(TypeError);
      expect(() => unwrap(errorData)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Cannot unwrap: Result.Error("test error") is not a success and there is no fallback]`,
      );
    });

    it("includes the Result instance as cause in the thrown TypeError", () => {
      const originalError = new Error("test error");
      const errorResult = result.error(originalError);

      expect(() => unwrap(errorResult)).toThrow(
        expect.objectContaining({
          cause: errorResult,
        }),
      );
    });

    it("throws when there is data and no fallback", () => {
      const errorData = result.error(new Error("test error"), {
        data: "test data",
      });
      expect(() => unwrap(errorData)).toThrow(TypeError);
      expect(() => unwrap(errorData)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Cannot unwrap: Result.Error("test error") is not a success and there is no fallback]`,
      );
    });

    it("returns the fallback when there is no data and a fallback is provided", () => {
      const errorData = result.error(new Error("test error"));
      const unwrapped = unwrap(errorData, "fallback");
      expect(unwrapped).toBe("fallback");
    });

    it("returns the fallback when there is data and a fallback is provided", () => {
      const errorData = result.error(new Error("test error"), {
        data: "test data",
      });
      const unwrapped = unwrap(errorData, "fallback");
      expect(unwrapped).toBe("fallback");
    });
  });
});
