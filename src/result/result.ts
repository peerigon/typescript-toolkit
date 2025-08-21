import { packageName } from "../lib/package.ts";
import { stringify } from "../lib/string";

// Namespaces are only used to group related types together.
/* eslint-disable @typescript-eslint/no-namespace */

// This module uses prototypes to create objects for the Result.Success and Result.Error types.
// This way unimportant properties won't show up in the debugger and we keep the memory footprint low.

export type Result<
  Data = unknown,
  GivenError extends GenericError = GenericError,
> = Result.Success<Data> | Result.Error<GivenError, Data>;

export const Result = {
  Status: {
    Success: "success",
    Error: "error",
  },
} as const;

// Using Symbol.for so that multiple instances of the library are compatible
const resultBrand = Symbol.for(`${packageName}/result/Result`);

export namespace Result {
  export namespace Status {
    export type Success = typeof Result.Status.Success;
    export type Error = typeof Result.Status.Error;
  }

  export type Status = Status.Success | Status.Error;

  /**
   * Represents a successful result that holds some data.
   */
  export type Success<Data = unknown> = Readonly<{
    status: Status.Success;
    /** Is true when there's data */
    isSuccess: true;
    /** Is true when there's an error */
    isError: false;
    data: Data;
    error: null;
  }>;

  /**
   * Represents a failed result that holds an error.
   * Might also contain stale data from a previous result.
   */
  export type Error<
    GivenError extends GenericError = GenericError,
    Data = undefined,
  > = Readonly<{
    status: Status.Error;
    /** Is true when there's data */
    isSuccess: false;
    /** Is true when there's an error */
    isError: true;
    /** Potentially stale data from a previous result */
    data: Data;
    /** The error that occurred */
    error: GivenError;
  }>;
}

/**
 * Calls the function and returns it as result.
 * If the function throws an Error, an error result is returned.
 * If the function throws anything else, it is rethrown.
 *
 * @param fn - The function to call
 * @returns The result of the function
 */
const from = <Data>(fn: () => Data): Result<Data> => {
  try {
    return success({ data: fn() });
  } catch (caughtError) {
    if (isError(caughtError)) {
      return error<GenericError>({ error: caughtError });
    }

    throw caughtError;
  }
};

/**
 * Calls and awaits the async function and returns it as result.
 * If the function rejects the promise, an error result is returned.
 * If the function rejects with anything else, the rejection is rethrown.
 *
 * @param fn - The async function to call and await
 * @returns The result of the async function
 */
const fromAsync = async <Data>(
  fn: () => Promise<Data>,
): Promise<Result<Data>> => {
  try {
    return success({ data: await fn() });
  } catch (caughtError) {
    if (isError(caughtError)) {
      return error<GenericError>({ error: caughtError });
    }

    throw caughtError;
  }
};

/**
 * Checks if the given value is an Error. Doesn't use instanceof so that
 * DOMException and errors from a different realm can be checked as well.
 */
const isError = (error: unknown): error is GenericError => {
  if ("isError" in Error && typeof Error.isError === "function") {
    const result: unknown = Error.isError(error);

    if (typeof result === "boolean") {
      return result;
    }
  }

  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof error.name === "string" &&
    "message" in error &&
    typeof error.message === "string" &&
    "stack" in error &&
    typeof error.stack === "string"
  );
};

/**
 * Creates a result in the success state.
 *
 * @param data - The data to store in the result
 * @returns The successful result
 */
const success = <const Data>({ data }: Pick<Result.Success<Data>, "data">) => {
  return Object.create(successPrototype, {
    data: { value: data, enumerable: true },
  }) as Result.Success<Data>;
};

const successPrototype: Result.Success<undefined> & {
  toString: () => string;
} = {
  status: Result.Status.Success,
  isSuccess: true,
  isError: false,
  data: undefined,
  error: null,
  toString() {
    return `Result.Success(${stringify(this.data)})`;
  },
} as const;

Object.defineProperties(successPrototype, {
  [resultBrand]: {
    value: true,
    enumerable: false,
  },
});

/**
 * Creates a result in the error state.
 *
 * @param error - The error to store in the result
 * @param data - Potentially stale data from a previous result
 * @returns The failed result
 */
const error = <const GivenError extends GenericError, const Data = never>({
  error,
  data,
}: Pick<Result.Error<GivenError, Data>, "error"> &
  Partial<Pick<Result.Error<GivenError, Data>, "data">>): Result.Error<
  GivenError,
  Data
> => {
  return Object.create(errorPrototype, {
    data: { value: data, enumerable: true },
    error: { value: error, enumerable: true },
  }) as Result.Error<GivenError, Data>;
};

const errorPrototype: Result.Error & {
  toString: () => string;
} = {
  status: Result.Status.Error,
  isSuccess: false,
  isError: true,
  data: undefined,
  error: new Error("Default error"),
  toString() {
    return `Result.Error(${stringify(this.error.message)})`;
  },
} as const;

Object.defineProperties(errorPrototype, {
  [resultBrand]: {
    value: true,
    enumerable: false,
  },
});

export const result = {
  from,
  fromAsync,
  success,
  error,
};

/**
 * Checks if the given value is a result.
 *
 * @param maybeValue - The value to check
 * @returns True if the value is a result, false otherwise
 */
export const isResult = (maybeValue: unknown): maybeValue is Result => {
  return (
    maybeValue !== null &&
    typeof maybeValue === "object" &&
    resultBrand in maybeValue
  );
};

type GenericError = Error;
