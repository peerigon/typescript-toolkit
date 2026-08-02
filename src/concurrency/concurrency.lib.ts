export type WithPromise<Data> = {
  /**
   * Resolves when the invocation succeeds, without calling the function yourself.
   * Starts pending until the first call is made and completes successfully.
   */
  readonly promise: Promise<Data>;
};

export const withPromiseProperty = <Fn, Data>(
  fn: Fn,
  passivePromise: Promise<Data>,
): Fn & WithPromise<Data> => {
  const wrapped = fn as Fn & WithPromise<Data>;

  Object.defineProperty(wrapped, "promise", {
    value: passivePromise,
    enumerable: true,
  });

  return wrapped;
};

export const promiseWithResolvers = <Data>() => {
  let resolve!: (value: Data) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<Data>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
