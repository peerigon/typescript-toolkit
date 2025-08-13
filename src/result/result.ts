import { stringify } from "../lib/string";

// Namespaces are only used to group related types together.
/* eslint-disable @typescript-eslint/no-namespace */
export type Result<
  Data = unknown,
  GivenError extends GenericError = GenericError,
> = Result.Success<Data> | Result.Error<GivenError>;

export const Result = {
  Status: {
    Success: "success",
    Error: "error",
  },
} as const;

const STATUS = [Result.Status.Success, Result.Status.Error] as const;

export namespace Result {
  export namespace Status {
    export type Success = typeof Result.Status.Success;
    export type Error = typeof Result.Status.Error;
  }

  export type Status = (typeof STATUS)[number];

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
    Data = never,
  > = Readonly<{
    status: Status.Error;
    /** Is true when there's data */
    isSuccess: false;
    /** Is true when there's an error */
    isError: true;
    /** Potentially stale data from a previous result */
    data: undefined | Data;
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
const success = <Data>({
  data,
}: Pick<Result.Success<Data>, "data">): Result.Success<Data> => {
  const successResult = {
    status: Result.Status.Success,
    isSuccess: true,
    isError: false,
    data,
    error: null,
    toString: createToString({ type: "Success", detail: data }),
  } as const;

  return successResult;
};

/**
 * Creates a result in the error state.
 *
 * @param error - The error to store in the result
 * @param data - Potentially stale data from a previous result
 * @returns The failed result
 */
const error = <GivenError extends GenericError, Data = never>({
  error,
  data,
}: Pick<Result.Error<GivenError, Data>, "error"> &
  Partial<Pick<Result.Error<GivenError, Data>, "data">>): Result.Error<
  GivenError,
  Data
> => {
  const errorResult = {
    status: Result.Status.Error,
    isSuccess: false,
    isError: true,
    data,
    error,
    toString: createToString({ type: "Error", detail: error.message }),
  } as const;

  return errorResult;
};

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
    maybeValue !== undefined &&
    maybeValue !== null &&
    typeof maybeValue === "object" &&
    "isSuccess" in maybeValue &&
    typeof maybeValue.isSuccess === "boolean" &&
    "isError" in maybeValue &&
    typeof maybeValue.isError === "boolean" &&
    "status" in maybeValue &&
    typeof maybeValue.status === "string" &&
    "data" in maybeValue &&
    "error" in maybeValue &&
    STATUS.includes(maybeValue.status as Result.Status)
  );
};

const createToString = ({
  type,
  detail,
}: {
  type: "Success" | "Error";
  detail: unknown;
}) => {
  return () => `Result.${type}(${stringify(detail)})`;
};

type GenericError = Error;
