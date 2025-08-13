import { describe, expect, it } from "vitest";
import { async } from "../async/async.ts";
import { result } from "../result/result.ts";
import { unwrap } from "./unwrap.ts";

describe("unwrap()", () => {
  describe("with different values", () => {
    it("returns a string", () => {
      const result: "hello" = unwrap("hello");
      expect(result).toBe("hello");
    });

    it("returns a number", () => {
      const result: 42 = unwrap(42);
      expect(result).toBe(42);
    });

    it("returns a boolean", () => {
      const result: true = unwrap(true);
      expect(result).toBe(true);
    });

    it("returns an object", () => {
      const object = { key: "value" };
      const result: { key: string } = unwrap(object);
      expect(result).toBe(object);
    });

    it("returns an array", () => {
      const array = [1, 2, 3];
      const result: Array<number> = unwrap(array);
      expect(result).toBe(array);
    });

    it("returns falsy values", () => {
      expect(unwrap(0)).toBe(0);
      expect(unwrap("")).toBe("");
      expect(unwrap(false)).toBe(false);
    });

    it("returns functions", () => {
      const func = () => "test";
      const result = unwrap(func);
      expect(result).toBe(func);
    });

    it("returns symbols", () => {
      const sym = Symbol("test");
      const result = unwrap(sym);
      expect(result).toBe(sym);
    });

    it("returns bigints", () => {
      const bigIntValue = BigInt(123);
      const result = unwrap(bigIntValue);
      expect(result).toBe(bigIntValue);
    });
  });

  describe("with undefined", () => {
    it("throws when no fallback is provided", () => {
      expect(() => unwrap(undefined)).toThrow(TypeError);
      expect(() => unwrap(undefined)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Unwrap failed: Result has no data, was {"status":"success","isSuccess":...]`,
      );
    });

    it("returns the fallback when a fallback is provided", () => {
      const result = unwrap(undefined, "fallback");
      expect(result).toBe("fallback");
    });
  });

  describe("with null", () => {
    it("throws when no fallback is provided", () => {
      expect(() => unwrap(null)).toThrow(TypeError);
      expect(() => unwrap(null)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Unwrap failed: Result has no data, was {"status":"success","isSuccess":...]`,
      );
    });

    it("returns the fallback when a fallback is provided", () => {
      const result = unwrap(null, "fallback");
      expect(result).toBe("fallback");
    });
  });

  describe("from result.success()", () => {
    it("returns data", () => {
      const success = result.success({ data: "test data" });
      const unwrapped: string = unwrap(success);
      expect(unwrapped).toBe("test data");
    });

    it("returns data even when data is undefined", () => {
      const success = result.success({ data: undefined });
      const unwrapped: undefined = unwrap(success);
      expect(unwrapped).toBe(undefined);
    });
  });

  describe("from result.error()", () => {
    it("throws when there is no data and no fallback", () => {
      const error = result.error({ error: new Error("test error") });
      expect(() => unwrap(error)).toThrow(TypeError);
      expect(() => unwrap(error)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Unwrap failed: Result has no data, was {"status":"error","isSuccess":...]`,
      );
    });

    it("returns the fallback when there is no data and a fallback is provided", () => {
      const error = result.error({ error: new Error("test error") });
      const unwrapped = unwrap(error, "fallback");
      expect(unwrapped).toBe("fallback");
    });

    it("returns the fallback when there is data and a fallback is provided", () => {
      const error = result.error({
        error: new Error("test error"),
        data: "test data",
      });
      const unwrapped = unwrap(error, "fallback");
      expect(unwrapped).toBe("fallback");
    });
  });

  describe("from async.success()", () => {
    it("returns data", () => {
      const asyncData = async.success({ data: "test data" });
      const unwrapped = unwrap(asyncData);
      expect(unwrapped).toBe("test data");
    });

    it("returns data even when data is undefined", () => {
      const result = async.success({ data: undefined });
      const unwrapped = unwrap(result);
      expect(unwrapped).toBe(undefined);
    });
  });

  describe("from async.pending()", () => {
    it("throws when there is no data and no fallback", () => {
      const asyncData = async.pending();
      expect(() => unwrap(asyncData)).toThrow(TypeError);
      expect(() => unwrap(asyncData)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Unwrap failed: Result has no data, was {"status":"pending","isSuccess...]`,
      );
    });

    it("returns data when there is data", () => {
      const asyncData = async.pending({ data: "test data" });
      const unwrapped = unwrap(asyncData);
      expect(unwrapped).toBe("test data");
    });

    it("returns the fallback when there is no data and a fallback is provided", () => {
      const asyncData = async.pending();
      const unwrapped = unwrap(asyncData, "fallback");
      expect(unwrapped).toBe("fallback");
    });
  });

  describe("from async.error()", () => {
    it("throws when there is no data and no fallback", () => {
      const asyncData = async.error({ error: new Error("test error") });
      expect(() => unwrap(asyncData)).toThrow(TypeError);
      expect(() => unwrap(asyncData)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Unwrap failed: Result has no data, was {"status":"error","isSuccess":...]`,
      );
    });

    it("throws when there is data and no fallback", () => {
      const asyncData = async.error({
        error: new Error("test error"),
        data: "test data",
      });
      expect(() => unwrap(asyncData)).toThrow(TypeError);
      expect(() => unwrap(asyncData)).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: Unwrap failed: Result has no data, was {"status":"error","isSuccess":...]`,
      );
    });

    it("returns the fallback when there is no data and a fallback is provided", () => {
      const asyncData = async.error({ error: new Error("test error") });
      const unwrapped = unwrap(asyncData, "fallback");
      expect(unwrapped).toBe("fallback");
    });

    it("returns the fallback when there is data and a fallback is provided", () => {
      const asyncData = async.error({
        error: new Error("test error"),
        data: "test data",
      });
      const unwrapped = unwrap(asyncData, "fallback");
      expect(unwrapped).toBe("fallback");
    });
  });
});
