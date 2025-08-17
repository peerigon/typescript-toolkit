type ErrorMessagePrimitive = string | false | undefined;

/**
 * ErrorMessage is a union of different possible error message types:
 *
 * - ErrorMessagePrimitive (that is string | false | undefined)
 * - A function that returns a ErrorMessagePrimitive
 *
 * undefined and false are possible error message types so that they can
 * be excluded in the production bundle via tree-shaking:
 *
 * import.meta.env.DEV && errorMessage
 *
 * Bundlers will replace import.meta.env.DEV with `false` and minifiers
 * will remove the right-hand side of the && operator.
 */
export type ErrorMessage =
  | ErrorMessagePrimitive
  | (() => ErrorMessagePrimitive);

/**
 * Returns the error message from the given error message or the default error message.
 *
 * @param errorMessage - The error message to return.
 * @param getDefaultErrorMessage - The default error message to return if the error message doesn't evaluate to a string.
 * @returns The error message.
 */
export const getErrorMessage = (
  errorMessage: ErrorMessage,
  getDefaultErrorMessage: () => string,
): string => {
  const errorMessagePrimitive: ErrorMessagePrimitive =
    typeof errorMessage === "function" ? errorMessage() : errorMessage;

  // Behavior for falsy values is actually wanted here
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  return errorMessagePrimitive || getDefaultErrorMessage();
};
