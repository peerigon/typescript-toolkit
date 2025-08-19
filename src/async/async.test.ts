import { inspect } from "node:util";
import {
  type QueryObserverLoadingErrorResult,
  type QueryObserverLoadingResult,
  type QueryObserverPendingResult,
  type QueryObserverResult,
  type QueryObserverSuccessResult,
} from "@tanstack/query-core";
import { describe, expect, it } from "vitest";
import { match } from "../match/match.ts";
import { result, type Result } from "../result/result.ts";
import { async, isAsync, type Async } from "./async.ts";

describe("async", () => {
  describe("pending()", () => {
    it("has the expected shape", () => {
      const asyncPending = async.pending();

      expect(inspect(asyncPending)).toMatchInlineSnapshot(
        `"{ data: undefined }"`,
      );
      expect(
        inspect(asyncPending, {
          showHidden: true,
        }),
      ).toMatchInlineSnapshot(`
        "{
          data: undefined,
          status: 'pending',
          isSuccess: false,
          isError: false,
          isPending: true,
          error: null
        }"
      `);
    });

    it("allows to pass in previous data", () => {
      const asyncPending = async.pending({ data: "some data" });

      expect(asyncPending.data).toBe("some data");
    });

    it("is compatible with tanstack query's QueryObserverLoadingResult", () => {
      const tanstackResult = {} as QueryObserverLoadingResult<string>;
      const asyncPending: Async.Pending = tanstackResult;

      // Dummy assertion
      expect(asyncPending).toBeDefined();
    });

    it("is compatible with tanstack query's QueryObserverPendingResult", () => {
      const tanstackResult = {} as QueryObserverPendingResult<string>;
      const asyncPending: Async.Pending = tanstackResult;

      // Dummy assertion
      expect(asyncPending).toBeDefined();
    });

    it("has a string representation (no data)", () => {
      const asyncPending = async.pending();
      expect(String(asyncPending)).toMatchInlineSnapshot(`"Async.Pending()"`);
    });

    it("has a string representation (simple data)", () => {
      const asyncPending = async.pending({ data: "some data" });

      expect(String(asyncPending)).toMatchInlineSnapshot(
        `"Async.Pending("some data")"`,
      );
    });

    it("has a string representation (complex data)", () => {
      const complexData = {
        name: "John",
        age: 30,
        active: true,
      };
      const asyncPending = async.pending({
        data: complexData,
      });

      expect(String(asyncPending)).toMatchInlineSnapshot(
        `"Async.Pending({"name":"John","age":30,"active":true})"`,
      );
    });

    it("infers undefined as data when no data is provided", () => {
      const asyncPending = async.pending();
      const inferredData: undefined = asyncPending.data;

      // Dummy assertion
      expect(inferredData).toBe(undefined);
    });

    it("infers the data type as const", () => {
      const asyncPending = async.pending({ data: "some data" });
      const inferredData: "some data" = asyncPending.data;

      // Dummy assertion
      expect(inferredData).toBeDefined();
    });
  });

  describe("success()", () => {
    it("has the expected shape", () => {
      const asyncSuccess = async.success({ data: "some data" });

      expect(inspect(asyncSuccess)).toMatchInlineSnapshot(
        `"{ data: 'some data' }"`,
      );
      expect(
        inspect(asyncSuccess, {
          showHidden: true,
        }),
      ).toMatchInlineSnapshot(`
        "{
          data: 'some data',
          status: 'success',
          isSuccess: true,
          isError: false,
          isPending: false,
          error: null
        }"
      `);
    });

    it("is compatible with Result.Success", () => {
      const asyncSuccess = async.success({ data: "test data" });
      const resultSuccess: Result.Success<string> = asyncSuccess;

      // Dummy assertion to ensure type compatibility
      expect(resultSuccess).toBeDefined();
    });

    it("is compatible with tanstack query's QueryObserverSuccessResult", () => {
      const tanstackResult = {} as QueryObserverSuccessResult<string>;
      const asyncSuccess: Async.Success<string> = tanstackResult;

      // Dummy assertion
      expect(asyncSuccess).toBeDefined();
    });

    it("has a string representation (simple data)", () => {
      const asyncSuccess = async.success({ data: "some data" });
      expect(String(asyncSuccess)).toMatchInlineSnapshot(
        `"Async.Success("some data")"`,
      );
    });

    it("has a string representation (complex data)", () => {
      const complexData = {
        name: "John",
        age: 30,
        active: true,
      };
      const asyncSuccess = async.success({ data: complexData });
      expect(String(asyncSuccess)).toMatchInlineSnapshot(
        `"Async.Success({"name":"John","age":30,"active":true})"`,
      );
    });

    it("infers the data type as const", () => {
      const asyncSuccess = async.success({ data: "some data" });
      const inferredData: "some data" = asyncSuccess.data;

      // Dummy assertion
      expect(inferredData).toBeDefined();
    });
  });

  describe("error()", () => {
    class TestError extends Error {}

    it("has the expected shape", () => {
      const error = new Error("some error");
      const asyncError = async.error({ error });

      // Removing the stack so that our snapshot is not polluted with the test file path
      error.stack = "";

      expect(inspect(asyncError)).toMatchInlineSnapshot(
        `"{ data: undefined, error: [Error: some error] }"`,
      );
      expect(
        inspect(asyncError, {
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
          isError: true,
          isPending: false
        }"
      `);
    });

    it("allows to pass in previous data", () => {
      const asyncError = async.error({
        error: new Error("some error"),
        data: "some data",
      });

      expect(asyncError.data).toBe("some data");
    });

    it("is compatible with Result.Error", () => {
      class CustomError extends Error {
        isCustomError = true;
      }
      const asyncError = async.error({ error: new CustomError("test error") });
      const resultError: Result.Error<CustomError> = asyncError;

      // Dummy assertion to ensure type compatibility
      expect(resultError).toBeDefined();
    });

    it("is compatible with tanstack query's QueryObserverLoadingErrorResult", () => {
      const tanstackResult = {} as QueryObserverLoadingErrorResult<
        string,
        TestError
      >;
      const asyncError: Async.Error<TestError> = tanstackResult;

      // Dummy assertion
      expect(asyncError).toBeDefined();
    });

    it("has a string representation (short message)", () => {
      const error = new Error("some error");
      const asyncError = async.error({ error });

      // Removing the stack so that our snapshot is not polluted with the test file path
      error.stack = "";

      expect(String(asyncError)).toMatchInlineSnapshot(
        `"Async.Error("some error")"`,
      );
    });

    it("has a string representation (long message)", () => {
      const error = new Error(
        "some error that is longer than the default limit it should be truncated",
      );
      const asyncError = async.error({ error });

      // Removing the stack so that our snapshot is not polluted with the test file path
      error.stack = "";

      expect(String(asyncError)).toMatchInlineSnapshot(
        `"Async.Error("some error that is longer than the default limit …)"`,
      );
    });

    it("infers the error and data type as const", () => {
      const error = new TypeError("some error");
      const asyncError = async.error({
        error,
        data: "some data",
      });
      const inferredData: "some data" = asyncError.data;
      const inferredError: TypeError = asyncError.error;

      // Dummy assertion
      expect(inferredData).toBeDefined();
      expect(inferredError).toBeDefined();
    });
  });

  it("works with match() for all states", () => {
    const pendingResult = async.pending() as Async;
    const pendingResultMatched: 0 | 1 | 2 = match(pendingResult.status).case([
      ["pending", 0],
      ["success", 1],
      ["error", 2],
    ]);
    expect(pendingResultMatched).toBe(0);

    const asyncSuccess = async.success({ data: "some data" }) as Async;
    const asyncSuccessMatched: 0 | 1 | 2 = match(asyncSuccess.status).case([
      ["pending", 0],
      ["success", 1],
      ["error", 2],
    ]);
    expect(asyncSuccessMatched).toBe(1);

    const errorData = async.error({ error: new Error("some error") }) as Async;
    const errorResultMatched: 0 | 1 | 2 = match(errorData.status).case([
      ["pending", 0],
      ["success", 1],
      ["error", 2],
    ]);
    expect(errorResultMatched).toBe(2);
  });

  it("is compatible with tanstack query's UseQueryResult", () => {
    const tanstackResult = {} as QueryObserverResult<string>;
    const async: Async<string> = tanstackResult;

    // Dummy assertion
    expect(async).toBeDefined();
  });
});

describe("isAsync()", () => {
  it("returns true for Async.Pending", () => {
    const asyncPending = async.pending();
    expect(isAsync(asyncPending)).toBe(true);
  });

  it("returns true for Async.Success", () => {
    const asyncSuccess = async.success({ data: "test data" });
    expect(isAsync(asyncSuccess)).toBe(true);
  });

  it("returns true for Async.Error", () => {
    const asyncError = async.error({ error: new Error("test error") });
    expect(isAsync(asyncError)).toBe(true);
  });

  it("returns false for Result.Success because it's missing some async properties", () => {
    const resultSuccess = result.success({ data: "test" });
    expect(isAsync(resultSuccess)).toBe(false);
  });

  it("returns false for Result.Error because it's missing some async properties", () => {
    const resultError = result.error({ error: new Error("test error") });
    expect(isAsync(resultError)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isAsync(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isAsync(undefined)).toBe(false);
  });

  it("returns false for plain objects", () => {
    expect(isAsync({})).toBe(false);
  });

  it("returns false for objects missing required properties", () => {
    expect(isAsync({ status: "success" })).toBe(false);
    expect(isAsync({ isSuccess: true })).toBe(false);
    expect(isAsync({ isError: false })).toBe(false);
  });

  it("returns false for objects missing isPending property", () => {
    const objectWithoutIsPending = {
      status: "success",
      isSuccess: true,
      isError: false,
      data: "test",
      error: null,
    };
    expect(isAsync(objectWithoutIsPending)).toBe(false);
  });

  it("returns false for objects with invalid status", () => {
    const objectWithInvalidStatus = {
      status: "invalid",
      isSuccess: true,
      isError: false,
      isPending: false,
      data: "test",
      error: null,
    };
    expect(isAsync(objectWithInvalidStatus)).toBe(false);
  });

  it("returns false for objects with wrong property types", () => {
    const objectWithWrongTypes = {
      status: 123,
      isSuccess: "true",
      isError: 0,
      isPending: "false",
      data: "test",
      error: null,
    };
    expect(isAsync(objectWithWrongTypes)).toBe(false);
  });
});
