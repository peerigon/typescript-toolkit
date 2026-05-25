import { inspect } from "node:util";
import {
  type QueryObserverLoadingErrorResult,
  type QueryObserverLoadingResult,
  type QueryObserverPendingResult,
  type QueryObserverResult,
  type QueryObserverSuccessResult,
} from "@tanstack/query-core";
import { describe, expect, expectTypeOf, it } from "vitest";
import { match } from "../match/match.ts";
import { isResult, result, type Result } from "../result/result.ts";

describe("result", () => {
  const createdAt = new Date(0);

  describe("pending()", () => {
    it("has the expected shape", () => {
      const resultPending = result.pending();

      expect(inspect(resultPending)).toMatchInlineSnapshot(
        `"{ data: undefined }"`,
      );
      expect(
        replaceAllDates(
          inspect(resultPending, {
            showHidden: true,
          }),
        ),
      ).toMatchInlineSnapshot(`
        "{
          data: undefined,
          [Symbol(Result)]: { createdAt: 1970-01-01T00:00:00.000Z },
          status: 'pending',
          isSuccess: false,
          isError: false,
          isPending: true,
          error: null
        }"
      `);
    });

    it("allows to pass in previous data", () => {
      const resultPending = result.pending({ data: "some data" });

      expect(resultPending.data).toBe("some data");
    });

    it("is compatible with tanstack query's QueryObserverLoadingResult", () => {
      expectTypeOf(
        {} as QueryObserverLoadingResult<string>,
      ).toExtend<Result.Pending>();
    });

    it("is compatible with tanstack query's QueryObserverPendingResult", () => {
      expectTypeOf(
        {} as QueryObserverPendingResult<string>,
      ).toExtend<Result.Pending>();
    });

    it("has a string representation (no data)", () => {
      const resultPending = result.pending();
      expect(String(resultPending)).toMatchInlineSnapshot(`"Result.Pending()"`);
    });

    it("has a string representation (simple data)", () => {
      const resultPending = result.pending({ data: "some data" });

      expect(String(resultPending)).toMatchInlineSnapshot(
        `"Result.Pending("some data")"`,
      );
    });

    it("has a string representation (complex data)", () => {
      const complexData = {
        name: "John",
        age: 30,
        active: true,
      };
      const resultPending = result.pending({
        data: complexData,
      });

      expect(String(resultPending)).toMatchInlineSnapshot(
        `"Result.Pending({"name":"John","age":30,"active":true})"`,
      );
    });

    it("infers undefined as data when no data is provided", () => {
      expectTypeOf(result.pending().data).toEqualTypeOf<undefined>();
    });

    it("infers the data type as const", () => {
      expectTypeOf(
        result.pending({ data: "some data" }).data,
      ).toEqualTypeOf<"some data">();
    });

    describe("metadata", () => {
      it("allows to pass in a createdAt", () => {
        const resultPending = result.pending({ createdAt });
        expect(result.metadata(resultPending).createdAt).toBe(createdAt);
      });
    });
  });

  describe("success()", () => {
    it("has the expected shape", () => {
      const resultSuccess = result.success({ data: "some data" });

      expect(inspect(resultSuccess)).toMatchInlineSnapshot(
        `"{ data: 'some data' }"`,
      );
      expect(
        replaceAllDates(
          inspect(resultSuccess, {
            showHidden: true,
          }),
        ),
      ).toMatchInlineSnapshot(`
        "{
          data: 'some data',
          [Symbol(Result)]: { createdAt: 1970-01-01T00:00:00.000Z },
          status: 'success',
          isSuccess: true,
          isError: false,
          isPending: false,
          error: null
        }"
      `);
    });

    it("is compatible with tanstack query's QueryObserverSuccessResult", () => {
      expectTypeOf({} as QueryObserverSuccessResult<string>).toExtend<
        Result.Success<string>
      >();
    });

    it("has a string representation (simple data)", () => {
      const resultSuccess = result.success({ data: "some data" });
      expect(String(resultSuccess)).toMatchInlineSnapshot(
        `"Result.Success("some data")"`,
      );
    });

    it("has a string representation (complex data)", () => {
      const complexData = {
        name: "John",
        age: 30,
        active: true,
      };
      const resultSuccess = result.success({ data: complexData });
      expect(String(resultSuccess)).toMatchInlineSnapshot(
        `"Result.Success({"name":"John","age":30,"active":true})"`,
      );
    });

    it("infers the data type as const", () => {
      expectTypeOf(
        result.success({ data: "some data" }).data,
      ).toEqualTypeOf<"some data">();
    });

    describe("metadata", () => {
      const data = "some data";

      it("allows to pass in a createdAt", () => {
        const resultSuccess = result.success({ createdAt, data });
        expect(result.metadata(resultSuccess).createdAt).toBe(createdAt);
      });
    });
  });

  describe("error()", () => {
    class TestError extends Error {}

    it("has the expected shape", () => {
      const error = new Error("some error");
      const resultError = result.error({ error });

      // Removing the stack so that our snapshot is not polluted with the test file path
      error.stack = "";

      expect(inspect(resultError)).toMatchInlineSnapshot(
        `"{ data: undefined, error: [Error: some error] }"`,
      );
      expect(
        replaceAllDates(
          inspect(resultError, {
            showHidden: true,
          }),
        ),
      ).toMatchInlineSnapshot(`
        "{
          data: undefined,
          error: [Error: some error] {
            [stack]: [Getter/Setter],
            [message]: 'some error'
          },
          [Symbol(Result)]: { createdAt: 1970-01-01T00:00:00.000Z },
          status: 'error',
          isSuccess: false,
          isError: true,
          isPending: false
        }"
      `);
    });

    it("allows to pass in previous data", () => {
      const resultError = result.error({
        error: new Error("some error"),
        data: "some data",
      });

      expect(resultError.data).toBe("some data");
    });

    it("is compatible with tanstack query's QueryObserverLoadingErrorResult", () => {
      expectTypeOf(
        {} as QueryObserverLoadingErrorResult<string, TestError>,
      ).toExtend<Result.Error<TestError>>();
    });

    it("has a string representation (short message)", () => {
      const error = new Error("some error");
      const resultError = result.error({ error });

      // Removing the stack so that our snapshot is not polluted with the test file path
      error.stack = "";

      expect(String(resultError)).toMatchInlineSnapshot(
        `"Result.Error("some error")"`,
      );
    });

    it("has a string representation (long message)", () => {
      const error = new Error(
        "some error that is longer than the default limit it should be truncated",
      );
      const resultError = result.error({ error });

      // Removing the stack so that our snapshot is not polluted with the test file path
      error.stack = "";

      expect(String(resultError)).toMatchInlineSnapshot(
        `"Result.Error("some error that is longer than the default limit …)"`,
      );
    });

    it("infers the error and data type as const", () => {
      const error = new TypeError("some error");
      const resultError = result.error({
        error,
        data: "some data",
      });

      expectTypeOf(resultError.data).toEqualTypeOf<"some data">();
      expectTypeOf(resultError.error).toEqualTypeOf<TypeError>();
    });

    describe("metadata", () => {
      const error = new Error("some error");

      it("allows to pass in a createdAt", () => {
        const resultError = result.error({ createdAt, error });
        expect(result.metadata(resultError).createdAt).toBe(createdAt);
      });
    });
  });

  describe("fromAsync()", () => {
    it("returns a success result when the async function resolves", async () => {
      const resultSuccess = await result.fromAsync(async () => "some data");

      expect(resultSuccess.isSuccess).toBe(true);
      expect(resultSuccess.data).toBe("some data");
      expect(inspect(resultSuccess)).toMatchInlineSnapshot(
        `"{ data: 'some data' }"`,
      );
      expect(
        replaceAllDates(
          inspect(resultSuccess, {
            showHidden: true,
          }),
        ),
      ).toMatchInlineSnapshot(`
        "{
          data: 'some data',
          [Symbol(Result)]: { createdAt: 1970-01-01T00:00:00.000Z },
          status: 'success',
          isSuccess: true,
          isError: false,
          isPending: false,
          error: null
        }"
      `);
    });

    it("returns an error result when the async function rejects with an Error", async () => {
      const givenError = new Error("some error");
      const resultError = await result.fromAsync(async () => {
        throw givenError;
      });

      // Removing the stack so that our snapshot is not polluted with the test file path
      givenError.stack = "";

      expect(resultError.isError).toBe(true);
      expect(resultError.error).toBe(givenError);
      expect(inspect(resultError)).toMatchInlineSnapshot(
        `"{ data: undefined, error: [Error: some error] }"`,
      );
      expect(
        replaceAllDates(
          inspect(resultError, {
            showHidden: true,
          }),
        ),
      ).toMatchInlineSnapshot(`
        "{
          data: undefined,
          error: [Error: some error] {
            [stack]: [Getter/Setter],
            [message]: 'some error'
          },
          [Symbol(Result)]: { createdAt: 1970-01-01T00:00:00.000Z },
          status: 'error',
          isSuccess: false,
          isError: true,
          isPending: false
        }"
      `);
    });

    it("returns an error result when the promise rejects with an Error", async () => {
      const givenError = new Error("rejected");
      const resultError = await result.fromAsync(() =>
        Promise.reject(givenError),
      );

      expect(resultError.isError).toBe(true);
      expect(resultError.error).toBe(givenError);
    });

    it("rethrows when the async function rejects with a non-Error value", async () => {
      await expect(
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        result.fromAsync(() => Promise.reject("not an error")),
      ).rejects.toBe("not an error");
    });

    it("infers the data type as const", async () => {
      const resultSuccess = await result.fromAsync(
        async () => "some data" as const,
      );
      if (resultSuccess.isSuccess) {
        expectTypeOf(resultSuccess.data).toEqualTypeOf<"some data">();
      }
    });
  });

  it("works with match() for all states", () => {
    const pendingResult = result.pending() as Result;
    const pendingResultMatched: 0 | 1 | 2 = match(pendingResult.status).case([
      ["pending", 0],
      ["success", 1],
      ["error", 2],
    ]);
    expect(pendingResultMatched).toBe(0);

    const successResult = result.success({ data: "some data" }) as Result;
    const successResultMatched: 0 | 1 | 2 = match(successResult.status).case([
      ["pending", 0],
      ["success", 1],
      ["error", 2],
    ]);
    expect(successResultMatched).toBe(1);

    const errorData = result.error({
      error: new Error("some error"),
    }) as Result;
    const errorResultMatched: 0 | 1 | 2 = match(errorData.status).case([
      ["pending", 0],
      ["success", 1],
      ["error", 2],
    ]);
    expect(errorResultMatched).toBe(2);
  });

  it("is compatible with tanstack query's UseQueryResult", () => {
    expectTypeOf({} as QueryObserverResult<string>).toExtend<Result<string>>();
  });

  const replaceAllDates = (snapshot: string) => {
    return snapshot.replaceAll(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g,
      "1970-01-01T00:00:00.000Z",
    );
  };
});

describe("result().case()", () => {
  it("handles pending result with else only", () => {
    const pendingResult = result.pending();
    const value = result(pendingResult).case({ else: "else" });
    expect(value).toBe("else");
  });

  it("handles pending result with success and else", () => {
    const pendingResult = result.pending();
    const value = result(pendingResult).case({
      success: () => "success",
      else: "else",
    });
    expect(value).toBe("else");
  });

  it("handles success result with success and else", () => {
    const successResult = result.success({ data: 42 });
    const value = result(successResult).case({
      success: () => "success",
      else: "else",
    });
    expect(value).toBe("success");
  });

  it("handles error result with pending, error, and else", () => {
    const errorResult = result.error({ error: new Error("test error") });
    const value = result(errorResult).case({
      pending: () => "pending",
      error: () => "error",
      else: "else",
    });
    expect(value).toBe("error");
  });

  it("handles null value", () => {
    const value = result(null).case({ else: "null result" });
    expect(value).toBe("null result");
  });

  it("handles undefined value", () => {
    const value = result(undefined).case({ else: "undefined result" });
    expect(value).toBe("undefined result");
  });

  it("passes the result's data to the handler functions", () => {
    const successResult = result.success({ data: "test data" });
    const value = result(successResult).case({
      success: (data: "test data") => data,
      else: "fallback",
    });
    expect(value).toBe("test data");
  });

  it("handles pending result's data to the pending handler", () => {
    const pendingResult = result.pending({ data: "stale data" });
    const value = result(pendingResult).case({
      pending: (data: "stale data") => `pending with ${data}`,
      else: "fallback",
    });
    expect(value).toBe("pending with stale data");
  });

  it("handles error result with error handler", () => {
    const errorResult = result.error({
      error: new Error("test error"),
      data: "stale data",
    });
    const value = result(errorResult).case({
      error: (error) => `error: ${error.message}`,
      else: "fallback",
    });
    expect(value).toBe("error: test error");
  });

  it("handles all states with specific handlers", () => {
    const pendingResult = result.pending();
    const successResult = result.success({ data: 100 });
    const errorResult = result.error({ error: new Error("fail") });

    const pendingValue = result(pendingResult).case({
      pending: () => "pending",
      success: () => "success",
      error: () => "error",
      else: "else",
    });
    expect(pendingValue).toBe("pending");

    const successValue = result(successResult).case({
      pending: () => "pending",
      success: () => "success",
      error: () => "error",
      else: "else",
    });
    expect(successValue).toBe("success");

    const errorValue = result(errorResult).case({
      pending: () => "pending",
      success: () => "success",
      error: () => "error",
      else: "else",
    });
    expect(errorValue).toBe("error");
  });

  it("works with different return types", () => {
    const successResult = result.success({ data: 42 });

    const stringValue = result(successResult).case({
      success: () => "success string",
      else: "else string",
    });
    expectTypeOf(stringValue).toEqualTypeOf<string>();
    expect(stringValue).toBe("success string");

    const numberValue = result(successResult).case({
      success: (data) => data,
      else: 0,
    });
    expectTypeOf(numberValue).toEqualTypeOf<number>();
    expect(numberValue).toBe(42);

    const objectValue = result(successResult).case({
      success: () => ({ status: "ok" }),
      else: { status: "not ok" },
    });
    expectTypeOf(objectValue).toEqualTypeOf<{ status: string }>();
    expect(objectValue).toEqual({ status: "ok" });
  });

  it("handles non-function values as handlers", () => {
    const successResult = result.success({ data: 42 });
    const errorResult = result.error({ error: new Error("test error") });
    const pendingResult = result.pending({ data: 10 });

    // Direct value for success
    const successValue = result(successResult).case({
      success: "direct success value",
      else: "fallback",
    });
    expect(successValue).toBe("direct success value");

    // Direct value for error
    const errorValue = result(errorResult).case({
      error: "direct error value",
      else: "fallback",
    });
    expect(errorValue).toBe("direct error value");

    // Direct value for pending
    const pendingValue = result(pendingResult).case({
      pending: "direct pending value",
      else: "fallback",
    });
    expect(pendingValue).toBe("direct pending value");

    // Direct value for else
    const elseValue = result(null).case({
      else: "direct else value",
    });
    expect(elseValue).toBe("direct else value");
  });

  it("can mix function and non-function handlers", () => {
    const successResult = result.success({ data: 42 });

    const value = result(successResult).case({
      success: (data) => `computed: ${data}`,
      error: "static error",
      else: "static else",
    });
    expect(value).toBe("computed: 42");

    const errorResult = result.error({ error: new Error("test") });
    const errorValue = result(errorResult).case({
      success: "static success",
      error: (error) => `error: ${error.message}`,
      else: "static else",
    });
    expect(errorValue).toBe("error: test");
  });

  it("can return falsy values", () => {
    const successResult = result.success({ data: "test" });

    const falsyValues = [undefined, null, false, 0, "", null];
    falsyValues.forEach((falsyValue) => {
      const result1 = result(successResult).case({
        success: falsyValue,
        else: "fallback",
      });
      expect(result1).toBe(falsyValue);
    });
  });
});

describe("isResult()", () => {
  it("returns true for Result.Pending", () => {
    const resultPending = result.pending();
    expect(isResult(resultPending)).toBe(true);
  });

  it("returns true for Result.Success", () => {
    const resultSuccess = result.success({ data: "test data" });
    expect(isResult(resultSuccess)).toBe(true);
  });

  it("returns true for Result.Error", () => {
    const resultError = result.error({ error: new Error("test error") });
    expect(isResult(resultError)).toBe(true);
  });

  it("returns true for plain Result.Success without pending state", () => {
    const plainSuccess = result.success({ data: "test" });
    expect(isResult(plainSuccess)).toBe(true);
  });

  it("returns true for plain Result.Error without pending state", () => {
    const plainError = result.error({ error: new Error("test error") });
    expect(isResult(plainError)).toBe(true);
  });

  it("returns false for null", () => {
    expect(isResult(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isResult(undefined)).toBe(false);
  });

  it("returns false for plain objects", () => {
    expect(isResult({})).toBe(false);
  });

  it("returns false for objects missing required properties", () => {
    expect(isResult({ status: "success" })).toBe(false);
    expect(isResult({ isSuccess: true })).toBe(false);
    expect(isResult({ isError: false })).toBe(false);
  });

  it("returns false for objects missing isPending property", () => {
    const objectWithoutIsPending = {
      status: "success",
      isSuccess: true,
      isError: false,
      data: "test",
      error: null,
    };
    expect(isResult(objectWithoutIsPending)).toBe(false);
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
    expect(isResult(objectWithInvalidStatus)).toBe(false);
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
    expect(isResult(objectWithWrongTypes)).toBe(false);
  });
});
