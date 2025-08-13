import { stringify } from "../lib/string.ts";
import { Result } from "./../result/result.ts";

// Namespaces are only used to group related types together.
/* eslint-disable @typescript-eslint/no-namespace */

// This module uses prototypes to create objects for the Async.Pending, Async.Success and Async.Error types.
// This way unimportant properties won't show up in the debugger and we keep the memory footprint low.

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
> =
  | Async.Pending<Data | undefined>
  | Async.Success<Data>
  | Async.Error<GivenError, Data | undefined>;

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
  export type Pending<Data = undefined> = Readonly<{
    status: Status.Pending;
    /** Is true when there's data */
    isSuccess: false;
    /** Is true when there's an error */
    isError: false;
    /** Is true when the request is pending */
    isPending: true;
    /** Potentially stale data from a previous result */
    data: Data;
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
    Data = undefined,
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
const asyncPending = <const Data>({
  data,
}: Pick<Partial<Async.Pending<Data>>, "data"> = {}): Async.Pending<Data> => {
  return Object.create(pendingPrototype, {
    data: { value: data, enumerable: true },
  }) as Async.Pending<Data>;
};

const pendingPrototype: Async.Pending & {
  toString: () => string;
} = {
  status: Async.Status.Pending,
  isSuccess: false,
  isError: false,
  isPending: true,
  data: undefined,
  error: null,
  toString() {
    return `Async.Pending(${
      // This is a prototype method. `this` might point to an instance.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      this.data === undefined ? "" : stringify(this.data)
    })`;
  },
} as const;

/**
 * Creates an async in the success state
 *
 * @param data - The data to store in the result
 * @returns The successful async result
 */
const asyncSuccess = <const Data>({
  data,
}: Pick<Async.Success<Data>, "data">): Async.Success<Data> => {
  return Object.create(successPrototype, {
    data: { value: data, enumerable: true },
  }) as Async.Success<Data>;
};

const successPrototype: Async.Success<undefined> & {
  toString: () => string;
} = {
  status: Async.Status.Success,
  isSuccess: true,
  isError: false,
  isPending: false,
  data: undefined,
  error: null,
  toString() {
    return `Async.Success(${stringify(this.data)})`;
  },
} as const;

/**
 * Creates an async result in the error state.
 *
 * @param error - The error to store in the result
 * @param data - Potentially stale data from a previous result
 * @returns The failed async result
 */
const asyncError = <const GivenError extends Error, const Data = never>({
  error: givenError,
  data,
}: Pick<Async.Error<GivenError, Data>, "error"> &
  Pick<Partial<Async.Error<GivenError, Data>>, "data">): Async.Error<
  GivenError,
  Data
> => {
  return Object.create(errorPrototype, {
    data: { value: data, enumerable: true },
    error: { value: givenError, enumerable: true },
  }) as Async.Error<GivenError, Data>;
};

const errorPrototype: Async.Error & {
  toString: () => string;
} = {
  status: Async.Status.Error,
  isSuccess: false,
  isError: true,
  isPending: false,
  data: undefined,
  error: new Error("Default error"),
  toString() {
    return `Async.Error(${stringify(this.error.message)})`;
  },
} as const;

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
export const isAsync = (maybeValue: unknown): maybeValue is Async => {
  return (
    maybeValue !== undefined &&
    maybeValue !== null &&
    typeof maybeValue === "object" &&
    "isSuccess" in maybeValue &&
    typeof maybeValue.isSuccess === "boolean" &&
    "isError" in maybeValue &&
    typeof maybeValue.isError === "boolean" &&
    "isPending" in maybeValue &&
    typeof maybeValue.isPending === "boolean" &&
    "status" in maybeValue &&
    typeof maybeValue.status === "string" &&
    "data" in maybeValue &&
    "error" in maybeValue &&
    STATUS.includes(maybeValue.status as Async.Status)
  );
};

type GenericError = Error;
