import {
  type QueryObserverLoadingErrorResult,
  type QueryObserverSuccessResult,
} from "@tanstack/query-core";
import { describe, expect, it } from "vitest";
import { async } from "../async/async.ts";
import { match } from "../match/match.ts";
import {
  error,
  isResult,
  result,
  success,
  type Result,
} from "../result/result.ts";

describe("success()", () => {
  it("has the expected shape", () => {
    const result = success({ data: "some data" });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": "some data",
        "error": null,
        "isError": false,
        "isSuccess": true,
        "status": "success",
      }
    `);
  });

  it("is compatible with tanstack query's QueryObserverSuccessResult", () => {
    const tanstackResult = {} as QueryObserverSuccessResult<string>;
    const _result: Result.Success<string> = tanstackResult;

    // Dummy assertion
    expect(_result).toBeDefined();
  });
});

describe("error()", () => {
  class TestError extends Error {}

  it("has the expected shape", () => {
    const result = error({ error: "some error" });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": undefined,
        "error": "some error",
        "isError": true,
        "isSuccess": false,
        "status": "error",
      }
    `);
  });

  it("is compatible with tanstack query's QueryObserverLoadingErrorResult", () => {
    const tanstackResult = {} as QueryObserverLoadingErrorResult<
      string,
      TestError
    >;
    const _result: Result.Error<TestError> = tanstackResult;

    // Dummy assertion
    expect(_result).toBeDefined();
  });
});

it("works with match()", () => {
  const result = success({ data: "some data" }) as Result;

  const isSuccess = match(result.status, {
    success: true,
    error: false,
  });

  expect(isSuccess).toBe(true);
});

describe("isResult()", () => {
  it("returns true for success results", () => {
    const successResult = success({ data: "test data" });
    expect(isResult(successResult)).toBe(true);
  });

  it("returns true for error results", () => {
    const errorResult = error({ error: "test error" });
    expect(isResult(errorResult)).toBe(true);
  });

  it("returns false for undefined", () => {
    expect(isResult(undefined)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isResult(null)).toBe(false);
  });

  it("returns false for primitive values", () => {
    expect(isResult("string")).toBe(false);
    expect(isResult(123)).toBe(false);
    expect(isResult(true)).toBe(false);
    expect(isResult(false)).toBe(false);
    expect(isResult(Symbol("test"))).toBe(false);
  });

  it("returns false for objects without required properties", () => {
    expect(isResult({})).toBe(false);
    expect(isResult({ isSuccess: true })).toBe(false);
    expect(isResult({ isError: false })).toBe(false);
    expect(isResult({ data: "test" })).toBe(false);
    expect(isResult({ error: "test" })).toBe(false);
    expect(isResult({ status: "success" })).toBe(false);
  });

  it("returns false for objects with wrong property types", () => {
    expect(
      isResult({
        isSuccess: "not boolean",
        isError: false,
        data: "test",
        error: null,
        status: "success",
      }),
    ).toBe(false);

    expect(
      isResult({
        isSuccess: true,
        isError: "not boolean",
        data: "test",
        error: null,
        status: "success",
      }),
    ).toBe(false);
  });

  it("returns false for objects with invalid status", () => {
    expect(
      isResult({
        isSuccess: true,
        isError: false,
        data: "test",
        error: null,
        status: "invalid",
      }),
    ).toBe(false);

    expect(
      isResult({
        isSuccess: false,
        isError: true,
        data: undefined,
        error: "test",
        status: "pending",
      }),
    ).toBe(false);
  });

  it("returns false for objects missing required properties", () => {
    expect(
      isResult({
        isSuccess: true,
        isError: false,
        data: "test",
        status: "success",
        // missing error property
      }),
    ).toBe(false);

    expect(
      isResult({
        isSuccess: false,
        isError: true,
        error: "test",
        status: "error",
        // missing data property
      }),
    ).toBe(false);
  });

  it("works with type guards in conditional logic", () => {
    const maybeResult = success({ data: "success" }) as unknown;

    if (isResult(maybeResult)) {
      // TypeScript should know this is a Result here
      expect(maybeResult.isSuccess).toBeDefined();
      expect(maybeResult.isError).toBeDefined();
      expect(maybeResult.data).toBeDefined();
      expect(maybeResult.error).toBeDefined();
      expect(maybeResult.status).toBeDefined();
    } else {
      expect(typeof maybeResult).toBe("string");
    }
  });

  it("returns true for async.success()", () => {
    const asyncData = async.success({ data: "test data" });

    expect(isResult(asyncData)).toBe(true);
  });

  it("returns true for async.error()", () => {
    const asyncData = async.error({ error: new Error("test error") });

    expect(isResult(asyncData)).toBe(true);
  });
});

describe("result()", () => {
  it("returns success result when function executes successfully", () => {
    const fn = () => "test data";
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": "test data",
        "error": null,
        "isError": false,
        "isSuccess": true,
        "status": "success",
      }
    `);
  });

  it("returns success result with complex data when function executes successfully", () => {
    const complexData = { id: 1, name: "test", items: [1, 2, 3] };
    const fn = () => complexData;
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "id": 1,
          "items": [
            1,
            2,
            3,
          ],
          "name": "test",
        },
        "error": null,
        "isError": false,
        "isSuccess": true,
        "status": "success",
      }
    `);
  });

  it("returns error result when function throws Error instance", () => {
    const errorMessage = "Something went wrong";
    const fn = () => {
      throw new Error(errorMessage);
    };
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": undefined,
        "error": [Error: Something went wrong],
        "isError": true,
        "isSuccess": false,
        "status": "error",
      }
    `);
  });

  it("returns error result when function throws custom Error class", () => {
    class CustomError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "CustomError";
      }
    }

    const fn = () => {
      throw new CustomError("Custom error message");
    };
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": undefined,
        "error": [CustomError: Custom error message],
        "isError": true,
        "isSuccess": false,
        "status": "error",
      }
    `);
  });

  it("rethrows when function throws non-Error values", () => {
    const fn = () => {
      throw "string error";
    };

    expect(() => result(fn)).toThrow("string error");
  });

  it("rethrows when function throws numbers", () => {
    const fn = () => {
      throw 42;
    };

    expect(() => result(fn)).toThrow(42);
  });

  it("rethrows when function throws null", () => {
    const fn = () => {
      throw null;
    };

    expect(() => result(fn)).toThrow(null);
  });

  it("rethrows when function throws undefined", () => {
    const fn = () => {
      throw undefined;
    };

    expect(() => result(fn)).toThrow(undefined);
  });

  it("rethrows when function throws objects that are not Error instances", () => {
    const fn = () => {
      throw { message: "not an error" };
    };

    expect(() => result(fn)).toThrow({ message: "not an error" });
  });

  it("works with async functions that return promises", () => {
    const fn = () => Promise.resolve("async data");
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": Promise {},
        "error": null,
        "isError": false,
        "isSuccess": true,
        "status": "success",
      }
    `);
  });

  it("works with functions that return undefined", () => {
    const fn = () => undefined;
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": undefined,
        "error": null,
        "isError": false,
        "isSuccess": true,
        "status": "success",
      }
    `);
  });

  it("works with functions that return null", () => {
    const fn = () => null;
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": null,
        "error": null,
        "isError": false,
        "isSuccess": true,
        "status": "success",
      }
    `);
  });

  it("works with functions that return boolean values", () => {
    const fn = () => true;
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": true,
        "error": null,
        "isError": false,
        "isSuccess": true,
        "status": "success",
      }
    `);
  });

  it("works with functions that return numbers", () => {
    const fn = () => 42;
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": 42,
        "error": null,
        "isError": false,
        "isSuccess": true,
        "status": "success",
      }
    `);
  });

  it("works with functions that return empty objects", () => {
    const fn = () => ({});
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": {},
        "error": null,
        "isError": false,
        "isSuccess": true,
        "status": "success",
      }
    `);
  });

  it("works with functions that return arrays", () => {
    const fn = () => [1, 2, 3];
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": [
          1,
          2,
          3,
        ],
        "error": null,
        "isError": false,
        "isSuccess": true,
        "status": "success",
      }
    `);
  });

  it("works with functions that return symbols", () => {
    const fn = () => Symbol("test");
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": Symbol(test),
        "error": null,
        "isError": false,
        "isSuccess": true,
        "status": "success",
      }
    `);
  });

  it("works with functions that return functions", () => {
    const fn = () => () => "nested function";
    const result = result(fn);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": [Function],
        "error": null,
        "isError": false,
        "isSuccess": true,
        "status": "success",
      }
    `);
  });
});
