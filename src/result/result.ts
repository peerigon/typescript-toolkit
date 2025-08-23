import { stringify } from "../lib/string.ts";
import { resultBrand } from "./result.lib.ts";

// Namespaces are only used to group related types together.
/* eslint-disable @typescript-eslint/no-namespace */

// This module uses prototypes to create objects for the Result.Pending, Result.Success and Result.Error types.
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
 * it can be represented as Result | undefined
 */
export type Result<
  Data = unknown,
  GivenError extends GenericError = GenericError,
> =
  | Result.Pending<Data | undefined>
  | Result.Success<Data>
  | Result.Error<GivenError, Data | undefined>;

export const Result = {
  Status: {
    Pending: "pending",
    Success: "success",
    Error: "error",
  },
} as const;

export namespace Result {
  export namespace Status {
    export type Pending = typeof Result.Status.Pending;
    export type Success = typeof Result.Status.Success;
    export type Error = typeof Result.Status.Error;
  }

  export type Status = Status.Pending | Status.Success | Status.Error;

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
    /** Is true when there's no result yet */
    isPending: true;
    /** Potentially stale data from a previous result */
    data: Data;
    error: null;
  }>;

  /**
   * Represents a successful result that holds some data.
   */
  export type Success<Data = unknown> = Readonly<{
    status: Status.Success;
    /** Is true when there's data */
    isSuccess: true;
    /** Is true when there's an error */
    isError: false;
    /** Is true when there's no result yet */
    isPending: false;
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
    /** Is true when there's no result yet */
    isPending: false;
    /** Potentially stale data from a previous result */
    data: Data;
    /** The error that occurred */
    error: GivenError;
  }>;

  /**
   * Represents a synchronous result that can be either success or error (no pending state).
   */
  export type Sync<
    Data = unknown,
    GivenError extends GenericError = GenericError,
  > = Success<Data> | Error<GivenError, Data>;
}

/**
 * Creates a result in the pending state.
 *
 * @param data - Potentially stale data from a previous result
 * @returns The pending result
 */
const pending = <const Data = undefined>({
  data,
}: Pick<Partial<Result.Pending<Data>>, "data"> = {}): Result.Pending<Data> => {
  return Object.create(pendingPrototype, {
    data: { value: data, enumerable: true },
  }) as Result.Pending<Data>;
};

const pendingPrototype: Result.Pending & {
  toString: () => string;
} = {
  status: Result.Status.Pending,
  isSuccess: false,
  isError: false,
  isPending: true,
  data: undefined,
  error: null,
  toString() {
    return `Result.Pending(${
      // This is a prototype method. `this` might point to an instance.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      this.data === undefined ? "" : stringify(this.data)
    })`;
  },
} as const;

Object.defineProperties(pendingPrototype, {
  [resultBrand]: {
    value: true,
    enumerable: false,
  },
});

/**
 * Creates a result in the success state.
 *
 * @param data - The data to store in the result
 * @returns The successful result
 */
const success = <const Data>({
  data,
}: Pick<Result.Success<Data>, "data">): Result.Success<Data> => {
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
  isPending: false,
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
const error = <const GivenError extends Error, const Data = never>({
  error: givenError,
  data,
}: Pick<Result.Error<GivenError, Data>, "error"> &
  Pick<Partial<Result.Error<GivenError, Data>>, "data">): Result.Error<
  GivenError,
  Data
> => {
  return Object.create(errorPrototype, {
    data: { value: data, enumerable: true },
    error: { value: givenError, enumerable: true },
  }) as Result.Error<GivenError, Data>;
};

const errorPrototype: Result.Error & {
  toString: () => string;
} = {
  status: Result.Status.Error,
  isSuccess: false,
  isError: true,
  isPending: false,
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

/**
 * Calls the function and returns it as result.
 * If the function throws an Error, an error result is returned.
 * If the function throws anything else, it is rethrown.
 *
 * @param fn - The function to call
 * @returns The result of the function
 */
const from = <Data>(fn: () => Data): Result.Sync<Data> => {
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
): Promise<Result.Sync<Data>> => {
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

export const result = {
  from,
  fromAsync,
  pending,
  success,
  error,
};

export { isResult } from "./result.lib.ts";

type GenericError = Error;
