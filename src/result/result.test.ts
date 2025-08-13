import {
  type QueryObserverLoadingErrorResult,
  type QueryObserverSuccessResult,
} from "@tanstack/query-core";
import { describe, expect, it } from "vitest";
import { async } from "../async/async.ts";
import { match } from "../match/match.ts";
import { isResult, result, type Result } from "./result.ts";

describe("result.success()", () => {
  it("has the expected shape", () => {
    const returned = result.success({ data: "some data" });

    expect(returned).toMatchInlineSnapshot(`
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

describe("result.error()", () => {
  class TestError extends Error {}

  it("has the expected shape", () => {
    const returned = result.error({ error: new Error("some error") });

    expect(returned).toMatchInlineSnapshot(`
      {
        "data": undefined,
        "error": [Error: some error],
        "isError": true,
        "isSuccess": false,
        "status": "error",
      }
    `);
  });

  it("allows data to be provided", () => {
    const returned = result.error({
      error: new Error("some error"),
      data: "some data",
    });

    expect(returned.data).toBe("some data");
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

describe("result()", () => {
  it("returns success result when function executes successfully", () => {
    const fn = () => "test data";
    const returned = result.from(fn);

    expect(returned.isSuccess).toBe(true);
    expect(returned.data).toBe("test data");
  });

  it("returns error result when function throws Error instance", () => {
    const errorMessage = "Something went wrong";
    class TestError extends Error {
      constructor() {
        super(errorMessage);
      }
    }

    const fn = () => {
      throw new TestError();
    };
    const returned = result.from(fn);

    expect(returned.isError).toBe(true);
    expect(returned.error).toBeInstanceOf(TestError);
    expect(returned.error!.message).toBe(errorMessage);
  });

  it("rethrows when function throws non-Error values", () => {
    const fn = (thing: any) => {
      throw thing;
    };

    const test = (thing: any) => {
      let caught: unknown;
      try {
        result.from(fn(thing));
      } catch (error) {
        caught = error;
      }

      expect(caught).toBe(thing);
    };

    test("string error");
    test(42);
    test(null);
    test(undefined);
    test({ message: "not an error" });
  });

  it("**does not** await promises, but wraps them in a result", () => {
    const promise = Promise.resolve("async data");
    const fn = () => promise;
    const returned = result.from(fn);

    expect(returned.isSuccess).toBe(true);
    expect(returned.data).toBe(promise);
  });
});

describe("result.async()", () => {
  it("returns success result when async function resolves successfully", async () => {
    const fn = async () => "async test data";
    const returned = await result.fromAsync(fn);

    expect(returned.isSuccess).toBe(true);
    expect(returned.data).toBe("async test data");
  });

  it("returns error result when async function rejects with Error instance", async () => {
    const errorMessage = "Async operation failed";
    class TestError extends Error {
      constructor() {
        super(errorMessage);
      }
    }

    const fn = async () => {
      throw new TestError();
    };
    const returned = await result.fromAsync(fn);

    expect(returned.isError).toBe(true);
    expect(returned.error).toBeInstanceOf(TestError);
    expect(returned.error!.message).toBe(errorMessage);
  });

  it("rethrows when async function rejects with non-Error values", async () => {
    const fn = async (thing: any) => {
      throw thing;
    };

    const test = async (thing: any) => {
      let caught: unknown;
      try {
        await result.fromAsync(() => fn(thing));
      } catch (error) {
        caught = error;
      }

      expect(caught).toBe(thing);
    };

    await test("string error");
    await test(42);
    await test(null);
    await test(undefined);
    await test({ message: "not an error" });
  });
});

it("works with match()", () => {
  const returned = result.success({ data: "some data" }) as Result;

  const isSuccess = match(returned.status, {
    success: true,
    error: false,
  });

  expect(isSuccess).toBe(true);
});

describe("isResult()", () => {
  it("returns true for success results", () => {
    const successResult = result.success({ data: "test data" });
    expect(isResult(successResult)).toBe(true);
  });

  it("returns true for error results", () => {
    const errorResult = result.error({ error: new Error("test error") });
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
    const maybeResult = result.success({ data: "success" }) as unknown;

    if (isResult(maybeResult)) {
      // TypeScript should know this is a Result here
      const definitelyResult: Result = maybeResult;
      expect(definitelyResult.isSuccess).toBeDefined();
      expect(definitelyResult.isError).toBeDefined();
      expect(definitelyResult.data).toBeDefined();
      expect(definitelyResult.error).toBeDefined();
      expect(definitelyResult.status).toBeDefined();
    } else {
      expect(typeof maybeResult).toBe("string");
    }
  });

  it("returns false for async.pending()", () => {
    const asyncData = async.pending();
    expect(isResult(asyncData)).toBe(false);
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
