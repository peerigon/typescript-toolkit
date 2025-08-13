import { inspect } from "node:util";
import {
  type QueryObserverLoadingErrorResult,
  type QueryObserverSuccessResult,
} from "@tanstack/query-core";
import { describe, expect, it } from "vitest";
import { async } from "../async/async.ts";
import { match } from "../match/match.ts";
import { isResult, result, type Result } from "./result.ts";

describe("result", () => {
  describe("success()", () => {
    it("has the expected shape", () => {
      const successResult = result.success({ data: "some data" });

      expect(inspect(successResult)).toMatchInlineSnapshot(
        `"{ data: 'some data' }"`,
      );
      expect(
        inspect(successResult, {
          showHidden: true,
        }),
      ).toMatchInlineSnapshot(`
        "{
          data: 'some data',
          status: 'success',
          isSuccess: true,
          isError: false,
          error: null
        }"
      `);
    });

    it("is compatible with tanstack query's QueryObserverSuccessResult", () => {
      const tanstackResult = {} as QueryObserverSuccessResult<string>;
      const resultSuccess: Result.Success<string> = tanstackResult;

      // Dummy assertion
      expect(resultSuccess).toBeDefined();
    });

    it("has a string representation (simple data)", () => {
      const successResult = result.success({ data: "some data" });

      expect(String(successResult)).toMatchInlineSnapshot(
        `"Result.Success("some data")"`,
      );
    });

    it("has a string representation (complex data)", () => {
      const complexData = {
        name: "John",
        age: 30,
        active: true,
      };
      const successResult = result.success({
        data: complexData,
      });

      expect(String(successResult)).toMatchInlineSnapshot(
        `"Result.Success({"name":"John","age":30,"active":true})"`,
      );
    });

    it("infers the data type as const", () => {
      const successResult = result.success({ data: "some data" });
      const inferredData: "some data" = successResult.data;

      // Dummy assertion
      expect(inferredData).toBeDefined();
    });
  });

  describe("error()", () => {
    class TestError extends Error {}

    it("has the expected shape", () => {
      const error = new Error("some error");
      const errorResult = result.error({ error });

      // Removing the stack so that our snapshot is not polluted with the test file path
      error.stack = "";

      expect(inspect(errorResult)).toMatchInlineSnapshot(
        `"{ data: undefined, error: [Error: some error] }"`,
      );
      expect(
        inspect(errorResult, {
          showHidden: true,
        }),
      ).toMatchInlineSnapshot(`
        "{
          data: undefined,
          error: [Error: some error] {
            [stack]: [Getter/Setter],
            [message]: 'some error'
          },
          status: 'error',
          isSuccess: false,
          isError: true
        }"
      `);
    });

    it("allows data to be provided", () => {
      const errorResult = result.error({
        error: new Error("some error"),
        data: "some data",
      });

      expect(errorResult.data).toBe("some data");
    });

    it("is compatible with tanstack query's QueryObserverLoadingErrorResult", () => {
      const tanstackResult = {} as QueryObserverLoadingErrorResult<
        string,
        TestError
      >;
      const resultError: Result.Error<TestError> = tanstackResult;

      // Dummy assertion
      expect(resultError).toBeDefined();
    });

    it("has a string representation (short message)", () => {
      const errorResult = result.error({ error: new Error("some error") });
      expect(String(errorResult)).toMatchInlineSnapshot(
        `"Result.Error("some error")"`,
      );
    });

    it("has a string representation (long message)", () => {
      const errorResult = result.error({
        error: new Error(
          "some error that is longer than the default limit it should be truncated",
        ),
      });
      expect(String(errorResult)).toMatchInlineSnapshot(
        `"Result.Error("some error that is longer than the default limit …)"`,
      );
    });

    it("infers the error and data type as const", () => {
      const error = new TypeError("some error");
      const errorResult = result.error({
        error,
        data: "some data",
      });
      const inferredData: "some data" = errorResult.data;
      const inferredError: TypeError = errorResult.error;

      // Dummy assertion
      expect(inferredData).toBeDefined();
      expect(inferredError).toBeDefined();
    });
  });

  describe("from()", () => {
    it("returns success result when function executes successfully", () => {
      const fn = () => "test data";
      const fnResult = result.from(fn);

      expect(fnResult.isSuccess).toBe(true);
      expect(fnResult.data).toBe("test data");
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
      const fnResult = result.from(fn);

      expect(fnResult.isError).toBe(true);
      expect(fnResult.error).toBeInstanceOf(TestError);
      expect(fnResult.error!.message).toBe(errorMessage);
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
      const fnResult = result.from(fn);

      expect(fnResult.isSuccess).toBe(true);
      expect(fnResult.data).toBe(promise);
    });
  });

  describe("fromAsync()", () => {
    it("returns success result when async function resolves successfully", async () => {
      const fn = async () => "async test data";
      const fnResult = await result.fromAsync(fn);

      expect(fnResult.isSuccess).toBe(true);
      expect(fnResult.data).toBe("async test data");
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
      const fnResult = await result.fromAsync(fn);

      expect(fnResult.isError).toBe(true);
      expect(fnResult.error).toBeInstanceOf(TestError);
      expect(fnResult.error!.message).toBe(errorMessage);
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
    const successResult = result.success({ data: "some data" }) as Result;

    const isSuccess = match(successResult.status, {
      success: true,
      error: false,
    });

    expect(isSuccess).toBe(true);
  });
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
