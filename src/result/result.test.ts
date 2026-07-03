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
      const resultSuccess = result.success("some data");

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
      const resultSuccess = result.success("some data");
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
      const resultSuccess = result.success(complexData);
      expect(String(resultSuccess)).toMatchInlineSnapshot(
        `"Result.Success({"name":"John","age":30,"active":true})"`,
      );
    });

    it("infers the data type as const", () => {
      expectTypeOf(
        result.success("some data").data,
      ).toEqualTypeOf<"some data">();
    });

    describe("metadata", () => {
      const data = "some data";

      it("allows to pass in a createdAt", () => {
        const resultSuccess = result.success(data, { createdAt });
        expect(result.metadata(resultSuccess).createdAt).toBe(createdAt);
      });
    });
  });

  describe("error()", () => {
    class TestError extends Error {}

    it("has the expected shape", () => {
      const error = new Error("some error");
      const resultError = result.error(error);

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
      const resultError = result.error(new Error("some error"), {
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
      const resultError = result.error(error);

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
      const resultError = result.error(error);

      // Removing the stack so that our snapshot is not polluted with the test file path
      error.stack = "";

      expect(String(resultError)).toMatchInlineSnapshot(
        `"Result.Error("some error that is longer than the default limit …)"`,
      );
    });

    it("infers the error and data type as const", () => {
      const error = new TypeError("some error");
      const resultError = result.error(error, { data: "some data" });

      expectTypeOf(resultError.data).toEqualTypeOf<"some data">();
      expectTypeOf(resultError.error).toEqualTypeOf<TypeError>();
    });

    describe("metadata", () => {
      const error = new Error("some error");

      it("allows to pass in a createdAt", () => {
        const resultError = result.error(error, { createdAt });
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

    const successResult = result.success("some data") as Result;
    const successResultMatched: 0 | 1 | 2 = match(successResult.status).case([
      ["pending", 0],
      ["success", 1],
      ["error", 2],
    ]);
    expect(successResultMatched).toBe(1);

    const errorData = result.error(new Error("some error")) as Result;
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
  it("dispatches to the handler matching the result status", () => {
    const pendingValue = result(result.pending()).case({
      pending: () => "pending",
      success: () => "success",
      error: () => "error",
      else: "else",
    });
    expectTypeOf(pendingValue).toEqualTypeOf<string>();
    expect(pendingValue).toBe("pending");

    const successValue = result(result.success(100)).case({
      pending: () => "pending",
      success: () => "success",
      error: () => "error",
      else: "else",
    });
    expectTypeOf(successValue).toEqualTypeOf<string>();
    expect(successValue).toBe("success");

    const errorValue = result(result.error(new Error("fail"))).case({
      pending: () => "pending",
      success: () => "success",
      error: () => "error",
      else: "else",
    });
    expectTypeOf(errorValue).toEqualTypeOf<string>();
    expect(errorValue).toBe("error");
  });

  it("falls through to else when the matching handler is missing", () => {
    // The unreachable `success` branch is dropped from the return type.
    const pendingValue = result(result.pending()).case({
      success: () => "success",
      else: "else",
    });
    expectTypeOf(pendingValue).toEqualTypeOf<string>();
    expect(pendingValue).toBe("else");

    const nullValue = result(null).case({ else: "null result" });
    expectTypeOf(nullValue).toEqualTypeOf<string>();
    expect(nullValue).toBe("null result");

    const undefinedValue = result(undefined).case({ else: "undefined result" });
    expectTypeOf(undefinedValue).toEqualTypeOf<string>();
    expect(undefinedValue).toBe("undefined result");
  });

  it("narrows the return type to the reachable branch", () => {
    // `success` is the only reachable branch, so the `else` number is ignored
    // and the return type stays the literal `42`.
    const value = result(result.success(42)).case({
      success: (data) => data,
      else: 0,
    });
    expectTypeOf(value).toEqualTypeOf<42>();
    expect(value).toBe(42);
  });

  it("infers the handler return types", () => {
    const successResult = result.success(42);

    const stringValue = result(successResult).case({
      success: () => "success string",
      else: "else string",
    });
    expectTypeOf(stringValue).toEqualTypeOf<string>();
    expect(stringValue).toBe("success string");

    const objectValue = result(successResult).case({
      success: () => ({ status: "ok" }),
      else: { status: "not ok" },
    });
    expectTypeOf(objectValue).toEqualTypeOf<{ status: string }>();
    expect(objectValue).toEqual({ status: "ok" });
  });

  it("passes the result data and error to the handlers", () => {
    const successValue = result(result.success("test data")).case({
      success: (data) => data,
      else: "fallback",
    });
    expectTypeOf(successValue).toEqualTypeOf<"test data">();
    expect(successValue).toBe("test data");

    const pendingValue = result(result.pending({ data: "stale data" })).case({
      pending: (data) => `pending with ${data}`,
      else: "fallback",
    });
    expectTypeOf(pendingValue).toEqualTypeOf<string>();
    expect(pendingValue).toBe("pending with stale data");

    const errorValue = result(result.error(new Error("test error"))).case({
      error: (error) => `error: ${error.message}`,
      else: "fallback",
    });
    expectTypeOf(errorValue).toEqualTypeOf<string>();
    expect(errorValue).toBe("error: test error");
  });

  it("accepts non-function handler values", () => {
    const directValue = result(result.success(42)).case({
      success: "direct success value",
      else: "fallback",
    });
    expectTypeOf(directValue).toEqualTypeOf<string>();
    expect(directValue).toBe("direct success value");

    const mixedValue = result(result.success(42)).case({
      success: (data) => `computed: ${data}`,
      error: "static error",
      else: "static else",
    });
    expectTypeOf(mixedValue).toEqualTypeOf<string>();
    expect(mixedValue).toBe("computed: 42");
  });

  it("returns falsy handler values", () => {
    const successResult = result.success("test");

    const falsyValues = [undefined, null, false, 0, ""];
    falsyValues.forEach((falsyValue) => {
      const value = result(successResult).case({
        success: falsyValue,
        else: "fallback",
      });
      expectTypeOf(value).toEqualTypeOf<string | number | boolean | null>();
      expect(value).toBe(falsyValue);
    });
  });
});

describe("isResult()", () => {
  it("returns true for Result.Pending", () => {
    const resultPending = result.pending();
    expect(isResult(resultPending)).toBe(true);
  });

  it("returns true for Result.Success", () => {
    const resultSuccess = result.success("test data");
    expect(isResult(resultSuccess)).toBe(true);
  });

  it("returns true for Result.Error", () => {
    const resultError = result.error(new Error("test error"));
    expect(isResult(resultError)).toBe(true);
  });

  it("returns true for plain Result.Success without pending state", () => {
    const plainSuccess = result.success("test");
    expect(isResult(plainSuccess)).toBe(true);
  });

  it("returns true for plain Result.Error without pending state", () => {
    const plainError = result.error(new Error("test error"));
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
