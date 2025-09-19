import {
  type QueryObserverLoadingErrorResult,
  type QueryObserverLoadingResult,
  type QueryObserverPendingResult,
  type QueryObserverResult,
  type QueryObserverSuccessResult,
} from "@tanstack/query-core";
import { inspect } from "node:util";
import { describe, expect, it } from "vitest";
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
      const tanstackResult = {} as QueryObserverLoadingResult<string>;
      const resultPending: Result.Pending = tanstackResult;

      // Dummy assertion
      expect(resultPending).toBeDefined();
    });

    it("is compatible with tanstack query's QueryObserverPendingResult", () => {
      const tanstackResult = {} as QueryObserverPendingResult<string>;
      const resultPending: Result.Pending = tanstackResult;

      // Dummy assertion
      expect(resultPending).toBeDefined();
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
      const resultPending = result.pending();
      const inferredData: undefined = resultPending.data;

      // Dummy assertion
      expect(inferredData).toBe(undefined);
    });

    it("infers the data type as const", () => {
      const resultPending = result.pending({ data: "some data" });
      const inferredData: "some data" = resultPending.data;

      // Dummy assertion
      expect(inferredData).toBeDefined();
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
      const tanstackResult = {} as QueryObserverSuccessResult<string>;
      const resultSuccess: Result.Success<string> = tanstackResult;

      // Dummy assertion
      expect(resultSuccess).toBeDefined();
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
      const resultSuccess = result.success({ data: "some data" });
      const inferredData: "some data" = resultSuccess.data;

      // Dummy assertion
      expect(inferredData).toBeDefined();
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
      const tanstackResult = {} as QueryObserverLoadingErrorResult<
        string,
        TestError
      >;
      const resultError: Result.Error<TestError> = tanstackResult;

      // Dummy assertion
      expect(resultError).toBeDefined();
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
      const inferredData: "some data" = resultError.data;
      const inferredError: TypeError = resultError.error;

      // Dummy assertion
      expect(inferredData).toBeDefined();
      expect(inferredError).toBeDefined();
    });

    describe("metadata", () => {
      const error = new Error("some error");

      it("allows to pass in a createdAt", () => {
        const resultError = result.error({ createdAt, error });
        expect(result.metadata(resultError).createdAt).toBe(createdAt);
      });
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
    const tanstackResult = {} as QueryObserverResult<string>;
    const resultType: Result<string> = tanstackResult;

    // Dummy assertion
    expect(resultType).toBeDefined();
  });

  const replaceAllDates = (snapshot: string) => {
    return snapshot.replaceAll(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g,
      "1970-01-01T00:00:00.000Z",
    );
  };
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
