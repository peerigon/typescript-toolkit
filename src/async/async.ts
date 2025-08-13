import { result, Result } from "./../result/result.ts";

// Namespaces are only used to group related types together.
/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Represents some async data that could be in the following states:
 *
 * - initial (not implemented, see below)
 * - pending
 * - success
 * - error
 *
 * This type is inspired by https://rametta.org/posts/elm-remote-data/ and has been
 * designed to be aligned with tanstack query's useQuery() result.
 * For instance, it can be used by a React component that wants to handle asynchronous
 * data but does not want to call useQuery directly.
 *
 * The initial state has not been implemented because it's not compatible
 * with tanstack query. If the initial state is needed,
 * it can be represented as Async | undefined
 */
export type Async<
  Data = unknown,
  GivenError extends GenericError = GenericError,
> = Async.Pending<Data> | Async.Success<Data> | Async.Error<GivenError, Data>;

export const Async = {
  Status: {
    Pending: "pending",
    Success: Result.Status.Success,
    Error: Result.Status.Error,
  },
} as const;

const STATUS = [
  Async.Status.Pending,
  Async.Status.Success,
  Async.Status.Error,
] as const;

export namespace Async {
  export namespace Status {
    export type Pending = typeof Async.Status.Pending;
    export type Success = typeof Async.Status.Success;
    export type Error = typeof Async.Status.Error;
  }

  export type Status = Result.Status | typeof Async.Status.Pending;

  /**
   * Represents a pending result where data is being loaded.
   * Pending might have stale data, but there's new data inflight.
   */
  export type Pending<Data = never> = Readonly<{
    status: Status.Pending;
    /** Is true when there's data */
    isSuccess: false;
    /** Is true when there's an error */
    isError: false;
    /** Is true when the request is pending */
    isPending: true;
    /** Potentially stale data from a previous result */
    data: undefined | Data;
    error: null;
  }>;

  /**
   * Represents a successful async result that holds some data.
   */
  export type Success<Data = unknown> = Result.Success<Data> &
    Readonly<{
      /** Is true when the request is pending */
      isPending: false;
    }>;

  /**
   * Represents an async result that has failed to load.
   * Might also contain stale data from a previous result.
   */
  export type Error<
    GivenError extends GenericError = GenericError,
    Data = never,
  > = Result.Error<GivenError, Data> &
    Readonly<{
      /** Is true when the request is pending */
      isPending: false;
    }>;
}

/**
 * Creates an async result in the pending state.
 *
 * @param data - Potentially stale data from a previous result
 * @returns The pending async result
 */
const asyncPending = <Data>({
  data,
}: Pick<Partial<Async.Pending<Data>>, "data"> = {}): Async.Pending<Data> => ({
  status: Async.Status.Pending,
  isSuccess: false,
  isError: false,
  isPending: true,
  data,
  error: null,
});

/**
 * Creates an async in the success state
 *
 * @param data - The data to store in the result
 * @returns The successful async result
 */
const asyncSuccess = <Data>({
  data,
}: Pick<Async.Success<Data>, "data">): Async.Success<Data> => ({
  ...result.success({ data }),
  isPending: false,
});

/**
 * Creates an async result in the error state.
 *
 * @param error - The error to store in the result
 * @param data - Potentially stale data from a previous result
 * @returns The failed async result
 */
const asyncError = <GivenError extends Error, Data = never>({
  error: givenError,
  data,
}: Pick<Async.Error<GivenError, Data>, "error"> &
  Pick<Partial<Async.Error<GivenError, Data>>, "data">): Async.Error<
  GivenError,
  Data
> => ({
  ...result.error({ error: givenError, data }),
  isPending: false,
});

export const async = {
  pending: asyncPending,
  success: asyncSuccess,
  error: asyncError,
};

/**
 * Checks if the given value is an async result.
 *
 * @param maybeValue - The value to check
 * @returns True if the value is an async result, false otherwise
 */
export const isAsync = (maybeValue: any): maybeValue is Async => {
  return (
    maybeValue !== undefined &&
    maybeValue !== null &&
    typeof maybeValue === "object" &&
    typeof maybeValue.isSuccess === "boolean" &&
    typeof maybeValue.isError === "boolean" &&
    typeof maybeValue.isPending === "boolean" &&
    "data" in maybeValue &&
    "error" in maybeValue &&
    "isPending" in maybeValue &&
    STATUS.includes(maybeValue.status)
  );
};

type GenericError = Error;
