/**
 * Returns a function that throws a copy of the given error.
 * A copy is necessary because for each throw error.stack is different.
 * You can also pass a function that returns a new error object.
 * In that case no copy is made.
 */
export const reject = (error: Error | (() => Error)) => {
  const createError =
    typeof error === "function" ? error : () => Object.create(error) as Error;

  const throwError = () => {
    const error = createError();

    Error.captureStackTrace(error, throwError);
    throw error;
  };

  return throwError;
};
