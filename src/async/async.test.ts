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
      const asyncData = async.pending();

      expect(asyncData).toMatchInlineSnapshot(`
        {
          "data": undefined,
          "error": null,
          "isError": false,
          "isPending": true,
          "isSuccess": false,
          "status": "pending",
        }
      `);
    });

    it("allows to pass in previous data", () => {
      const asyncData = async.pending({ data: "some data" });

      expect(asyncData.data).toBe("some data");
    });

    it("is compatible with tanstack query's QueryObserverLoadingResult", () => {
      const tanstackResult = {} as QueryObserverLoadingResult<string>;
      const _asyncData: Async.Pending = tanstackResult;

      // Dummy assertion
      expect(_asyncData).toBeDefined();
    });

    it("is compatible with tanstack query's QueryObserverPendingResult", () => {
      const tanstackResult = {} as QueryObserverPendingResult<string>;
      const _asyncData: Async.Pending = tanstackResult;

      // Dummy assertion
      expect(_asyncData).toBeDefined();
    });
  });

  describe("success()", () => {
    it("has the expected shape", () => {
      const asyncData = async.success({ data: "some data" });

      expect(asyncData).toMatchInlineSnapshot(`
        {
          "data": "some data",
          "error": null,
          "isError": false,
          "isPending": false,
          "isSuccess": true,
          "status": "success",
        }
      `);
    });

    it("is compatible with Result.Success", () => {
      const asyncSuccess = async.success({ data: "test data" });
      const _resultSuccess: Result.Success<string> = asyncSuccess;

      // Dummy assertion to ensure type compatibility
      expect(_resultSuccess).toBeDefined();
    });

    it("is compatible with tanstack query's QueryObserverSuccessResult", () => {
      const tanstackResult = {} as QueryObserverSuccessResult<string>;
      const _asyncData: Async.Success<string> = tanstackResult;

      // Dummy assertion
      expect(_asyncData).toBeDefined();
    });
  });

  describe("error()", () => {
    class TestError extends Error {}

    it("has the expected shape", () => {
      const asyncData = async.error({ error: new Error("some error") });

      expect(asyncData).toMatchInlineSnapshot(`
        {
          "data": undefined,
          "error": [Error: some error],
          "isError": true,
          "isPending": false,
          "isSuccess": false,
          "status": "error",
        }
      `);
    });

    it("allows to pass in previous data", () => {
      const asyncData = async.error({
        error: new Error("some error"),
        data: "some data",
      });

      expect(asyncData.data).toBe("some data");
    });

    it("is compatible with Result.Error", () => {
      class CustomError extends Error {
        isCustomError = true;
      }
      const asyncError = async.error({ error: new CustomError("test error") });
      const _resultError: Result.Error<CustomError> = asyncError;

      // Dummy assertion to ensure type compatibility
      expect(_resultError).toBeDefined();
    });

    it("is compatible with tanstack query's QueryObserverLoadingErrorResult", () => {
      const tanstackResult = {} as QueryObserverLoadingErrorResult<
        string,
        TestError
      >;
      const _asyncData: Async.Error<TestError> = tanstackResult;

      // Dummy assertion
      expect(_asyncData).toBeDefined();
    });
  });

  it("works with match() for all states", () => {
    const pendingData = async.pending() as Async;
    const pendingResult = match(pendingData.status, {
      pending: "pending",
      success: "success",
      error: "error",
    });
    expect(pendingResult).toBe("pending");

    const successData = async.success({ data: "some data" }) as Async;
    const successResult = match(successData.status, {
      pending: "pending",
      success: "success",
      error: "error",
    });
    expect(successResult).toBe("success");

    const errorData = async.error({ error: new Error("some error") }) as Async;
    const errorResult = match(errorData.status, {
      pending: "pending",
      success: "success",
      error: "error",
    });
    expect(errorResult).toBe("error");
  });

  it("is compatible with tanstack query's UseQueryResult", () => {
    const tanstackResult = {} as QueryObserverResult<string>;
    const _asyncData: Async<string> = tanstackResult;

    // Dummy assertion
    expect(_asyncData).toBeDefined();
  });
});

describe("isAsync()", () => {
  it("returns true for Async.Pending", () => {
    const pendingData = async.pending();
    expect(isAsync(pendingData)).toBe(true);
  });

  it("returns true for Async.Success", () => {
    const successData = async.success({ data: "test data" });
    expect(isAsync(successData)).toBe(true);
  });

  it("returns true for Async.Error", () => {
    const errorData = async.error({ error: new Error("test error") });
    expect(isAsync(errorData)).toBe(true);
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
